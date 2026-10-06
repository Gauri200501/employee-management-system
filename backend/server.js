const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const Employee = require('./models/Employee');
const Department = require('./models/Department');
const Designation = require('./models/Designation');
const errorMiddleware = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

// Global error handler
app.use(errorMiddleware);

const seedDefaultReferenceData = async () => {
  const defaultDepartments = [
    { departmentId: 'CS', name: 'Computer Science', description: 'Software engineering and product teams', status: 'Active' },
    { departmentId: 'IS', name: 'Information Science', description: 'Data, systems, and analytics', status: 'Active' },
    { departmentId: 'HR', name: 'Human Resources', description: 'People operations and talent management', status: 'Active' },
    { departmentId: 'FIN', name: 'Finance', description: 'Finance and controls', status: 'Active' },
    { departmentId: 'MKT', name: 'Marketing', description: 'Brand, campaigns, and demand generation', status: 'Active' },
    { departmentId: 'OTH', name: 'Other', description: 'Cross-functional and miscellaneous teams', status: 'Active' },
  ];

  for (const dept of defaultDepartments) {
    const existing = await Department.findOne({ name: dept.name });
    if (!existing) {
      await Department.create(dept);
    }
  }

  const defaultDesignations = [
    { designationId: 'INT', title: 'Intern', description: 'Internship role', status: 'Active' },
    { designationId: 'SD', title: 'Software Developer', description: 'Software development', status: 'Active' },
    { designationId: 'SE', title: 'Software Engineer', description: 'Engineering role', status: 'Active' },
    { designationId: 'HRM', title: 'HR Manager', description: 'Human resources management', status: 'Active' },
    { designationId: 'PM', title: 'Project Manager', description: 'Project leadership', status: 'Active' },
  ];

  for (const item of defaultDesignations) {
    const existing = await Designation.findOne({ title: item.title });
    if (!existing) {
      await Designation.create(item);
    }
  }
};

// Connect DB and seed default records if they do not exist
const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET must be configured before starting the server.');
    }

    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && adminPassword) {
      const adminExists = await Employee.findOne({ email: adminEmail });
      if (!adminExists) {
        await Employee.create({
          employeeId: 'EMP0001',
          email: adminEmail,
          password: adminPassword,
          role: 'Admin',
          personal: {
            firstName: 'System',
            lastName: 'Admin',
            gender: 'Male',
            nationality: 'Indian',
          },
          contact: {
            personalEmail: adminEmail,
            officialEmail: adminEmail,
            mobileNumber: '+91 90000 00001',
            currentAddress: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
          },
          employment: {
            department: 'Human Resources',
            designation: 'HR Manager',
            employmentType: 'Full Time',
            joiningDate: new Date(),
            workLocation: 'Bangalore',
            status: 'Active',
          },
        });
        console.log('✅ Initial administrator account seeded.');
      }
    } else {
      console.warn('Initial administrator not seeded; set ADMIN_EMAIL and ADMIN_PASSWORD to create one.');
    }

    await seedDefaultReferenceData();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:');
    console.error(error);
    if (error && error.stack) {
      console.error(error.stack);
    }
  }
};

startServer();
