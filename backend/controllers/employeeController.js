const Employee = require('../models/Employee');

const normalizeEmployeePayload = (payload = {}) => {
  const base = { ...payload };

  if (!base.personal && (base.firstName || base.lastName || base.gender || base.dob)) {
    base.personal = {
      firstName: base.firstName || '',
      middleName: base.middleName || '',
      lastName: base.lastName || '',
      gender: base.gender || undefined,
      dob: base.dob || undefined,
      bloodGroup: base.bloodGroup || undefined,
      maritalStatus: base.maritalStatus || undefined,
      nationality: base.nationality || 'Indian',
      profilePhoto: base.profilePhoto || undefined,
    };
  }

  if (!base.contact && (base.phone || base.address || base.email || base.personalEmail || base.officialEmail)) {
    base.contact = {
      personalEmail: base.personalEmail || base.email || undefined,
      officialEmail: base.officialEmail || undefined,
      mobileNumber: base.phone || undefined,
      currentAddress: {
        address: base.address || undefined,
        city: base.city || undefined,
        state: base.state || undefined,
        country: base.country || 'India',
        pinCode: base.pinCode || undefined,
      },
    };
  }

  if (!base.employment && (base.department || base.position || base.hireDate || base.role || base.status || base.salary)) {
    base.employment = {
      department: base.department || '',
      designation: base.position || '',
      employmentType: base.employmentType || 'Full Time',
      joiningDate: base.hireDate || undefined,
      workLocation: base.workLocation || 'Bangalore',
      status: base.status || 'Active',
      salary: base.salary || undefined,
    };
  }

  if (base.email && !base.personal?.firstName && base.firstName) {
    base.personal = { ...base.personal, firstName: base.firstName };
  }

  if (base.email && !base.personal?.lastName && base.lastName) {
    base.personal = { ...base.personal, lastName: base.lastName };
  }

  return base;
};

const generateEmployeeId = async () => {
  const lastEmployee = await Employee.findOne({}).sort({ employeeId: -1 }).lean();

  let nextNum = 1;
  if (lastEmployee?.employeeId) {
    const match = lastEmployee.employeeId.match(/\d+/);
    nextNum = match ? parseInt(match[0], 10) + 1 : 1;
  }

  let empId = `EMP${String(nextNum).padStart(6, '0')}`;
  while (await Employee.findOne({ employeeId: empId })) {
    nextNum += 1;
    empId = `EMP${String(nextNum).padStart(6, '0')}`;
  }
  return empId;
};

// @desc    Get all employees (with search, filter, pagination)
// @route   GET /api/employees
// @access  Authenticated
const getAllEmployees = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department = '',
      status = '',
      role = '',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const filter = { isDeleted: false };
    const trimmedSearch = String(search || '').trim();

    if (trimmedSearch) {
      const regex = new RegExp(trimmedSearch, 'i');
      filter.$or = [
        { employeeId: regex },
        { email: regex },
        { 'personal.firstName': regex },
        { 'personal.lastName': regex },
        { 'contact.mobileNumber': regex },
        { 'employment.department': regex },
        { 'employment.designation': regex },
      ];
    }

    if (department) filter['employment.department'] = department;
    if (status) filter['employment.status'] = status;
    if (role) filter.role = role;

    const totalEmployees = await Employee.countDocuments(filter);
    const employees = await Employee.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      employees,
      pagination: {
        total: totalEmployees,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalEmployees / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Authenticated
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({
      $or: [{ _id: req.params.id }, { employeeId: req.params.id }],
      isDeleted: false,
    }).select('-password');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    if (req.employee.role === 'Employee' && req.employee._id.toString() !== employee._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ success: true, employee: employee.toSafeJSON() });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Admin, HR
const createEmployee = async (req, res, next) => {
  try {
    const sanitized = normalizeEmployeePayload(req.body);

    const requiredNames = sanitized.personal?.firstName && sanitized.personal?.lastName;
    const requiredEmail = sanitized.email || sanitized.contact?.personalEmail || sanitized.contact?.officialEmail;
    const requiredDepartment = sanitized.employment?.department || sanitized.department;
    const requiredDesignation = sanitized.employment?.designation || sanitized.position;
    const requiredJoinDate = sanitized.employment?.joiningDate || sanitized.hireDate;

    if (!requiredNames || !requiredEmail || !requiredDepartment || !requiredDesignation || !requiredJoinDate) {
      return res.status(400).json({
        message: 'First name, last name, email, department, designation, and join date are required.',
      });
    }

    if ((sanitized.role === 'Admin' || sanitized.role === 'HR') && req.employee.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can assign Admin or HR roles.' });
    }

    const cleanEmail = String(requiredEmail).trim().toLowerCase();
    const existing = await Employee.findOne({ email: cleanEmail, isDeleted: false });
    if (existing) {
      return res.status(409).json({ message: 'An employee with this email already exists.' });
    }

    const employeeId = await generateEmployeeId();
    const employee = await Employee.create({
      employeeId,
      email: cleanEmail,
      password: sanitized.password || 'Password@123',
      role: sanitized.role || 'Employee',
      personal: sanitized.personal || {
        firstName: sanitized.firstName || '',
        lastName: sanitized.lastName || '',
      },
      contact: sanitized.contact || {
        personalEmail: cleanEmail,
        officialEmail: cleanEmail,
        mobileNumber: sanitized.phone || '',
      },
      employment: sanitized.employment || {
        department: requiredDepartment,
        designation: requiredDesignation,
        employmentType: sanitized.employmentType || 'Full Time',
        joiningDate: requiredJoinDate,
        workLocation: sanitized.workLocation || 'Bangalore',
        status: sanitized.status || 'Active',
        salary: sanitized.salary || undefined,
      },
      professional: sanitized.professional || {},
      education: Array.isArray(sanitized.education) ? sanitized.education : [],
      skills: Array.isArray(sanitized.skills) ? sanitized.skills : [],
      certifications: Array.isArray(sanitized.certifications) ? sanitized.certifications : [],
      previousEmployment: Array.isArray(sanitized.previousEmployment) ? sanitized.previousEmployment : [],
      emergencyContacts: Array.isArray(sanitized.emergencyContacts) ? sanitized.emergencyContacts : [],
      documents: Array.isArray(sanitized.documents) ? sanitized.documents : [],
    });

    res.status(201).json({ success: true, employee: employee.toSafeJSON() });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Admin, HR, Employee (self-only limited fields)
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    if (req.employee.role === 'Employee' && req.employee._id.toString() !== employee._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    if (req.body.role && req.body.role !== employee.role && req.employee.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can change employee roles.' });
    }

    const sanitized = normalizeEmployeePayload(req.body);
    if (sanitized.email) {
      const cleanEmail = String(sanitized.email).trim().toLowerCase();
      const existing = await Employee.findOne({
        email: cleanEmail,
        _id: { $ne: employee._id },
        isDeleted: false,
      });
      if (existing) {
        return res.status(409).json({ message: 'Email is already in use by another employee.' });
      }
      sanitized.email = cleanEmail;
    }

    if (req.employee.role === 'Employee') {
      delete sanitized.role;
      delete sanitized.password;
      delete sanitized.employment?.department;
      delete sanitized.employment?.designation;
      delete sanitized.employment?.status;
      delete sanitized.employment?.joiningDate;
      delete sanitized.salary;
    }

    if (sanitized.password && String(sanitized.password).trim() !== '') {
      employee.password = sanitized.password;
      delete sanitized.password;
    }

    if (sanitized.personal) employee.personal = { ...employee.personal.toObject ? employee.personal.toObject() : employee.personal, ...sanitized.personal };
    if (sanitized.contact) employee.contact = { ...employee.contact, ...sanitized.contact };
    if (sanitized.employment) employee.employment = { ...employee.employment, ...sanitized.employment };
    if (sanitized.professional) employee.professional = { ...employee.professional, ...sanitized.professional };

    if (sanitized.education) employee.education = sanitized.education;
    if (sanitized.skills) employee.skills = sanitized.skills;
    if (sanitized.certifications) employee.certifications = sanitized.certifications;
    if (sanitized.previousEmployment) employee.previousEmployment = sanitized.previousEmployment;
    if (sanitized.emergencyContacts) employee.emergencyContacts = sanitized.emergencyContacts;
    if (sanitized.documents) employee.documents = sanitized.documents;

    if (sanitized.email) employee.email = sanitized.email;
    if (sanitized.role) employee.role = sanitized.role;
    if (sanitized.employeeId) employee.employeeId = sanitized.employeeId;

    await employee.save();
    res.json({ success: true, employee: employee.toSafeJSON() });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Admin only
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found.' });
    }

    if (req.employee.role !== 'Admin') {
      return res.status(403).json({ message: 'Only Admins can delete employees.' });
    }

    if (req.employee._id.toString() === employee._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }

    employee.isDeleted = true;
    employee.deletedAt = new Date();
    employee.deletedBy = req.employee._id;
    await employee.save();

    res.json({ success: true, message: 'Employee deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/employees/stats
// @access  Authenticated
const getDashboardStats = async (req, res, next) => {
  try {
    const active = await Employee.countDocuments({ isDeleted: false, 'employment.status': 'Active' });
    const inactive = await Employee.countDocuments({ isDeleted: false, 'employment.status': 'Inactive' });
    const onLeave = await Employee.countDocuments({ isDeleted: false, 'employment.status': 'On Leave' });
    const terminated = await Employee.countDocuments({ isDeleted: false, 'employment.status': 'Terminated' });
    const total = await Employee.countDocuments({ isDeleted: false });

    const byDepartment = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$employment.department', count: { $sum: 1 } } },
      { $project: { department: '$_id', count: 1, _id: 0 } },
      { $sort: { department: 1 } },
    ]);

    const byRole = await Employee.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $project: { role: '$_id', count: 1, _id: 0 } },
      { $sort: { role: 1 } },
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentHires = await Employee.countDocuments({
      isDeleted: false,
      'employment.joiningDate': { $gte: thirtyDaysAgo },
    });

    res.json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        onLeave,
        terminated,
        recentHires,
        byDepartment,
        byRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDashboardStats,
  generateEmployeeId,
};

