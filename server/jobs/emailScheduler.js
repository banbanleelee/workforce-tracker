const cron = require('node-cron');
const nodemailer = require('nodemailer');
const XLSX = require('xlsx');
const User = require('../models/User');

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // Or another SMTP service provider
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password or app-specific password
  },
});

// Generate Excel File Function
const generateExcelFile = async () => {
  try {
    // Fetch all historical user data from the database
    const users = await User.find({}).select('firstName lastName email role tasks');

    // Convert all user data into Excel format
    const worksheet = XLSX.utils.json_to_sheet(
      users.flatMap((user) => 
        user.tasks.map((task) => ({
          'First Name': user.firstName,
          'Last Name': user.lastName,
          Email: user.email,
          Role: user.role,
          Queue: task.queue,
          'Time Spent (s)': task.timeSpent,
          'Date Completed': task.endDate ? XLSX.SSF.format('yyyy-mm-dd', new Date(task.endDate)) : 'N/A',
          'Start Time': task.startDate ? new Date(task.startDate).toLocaleTimeString('en-US', { hour12: false }) : 'N/A',
          'End Time': task.endDate ? new Date(task.endDate).toLocaleTimeString('en-US', { hour12: false }) : 'N/A',
        }))
      )
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'All Historical User Data');

    const filePath = './all_user_data.xlsx'; // File name reflects historical data
    XLSX.writeFile(workbook, filePath);
    return filePath;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    throw error;
  }
};

// Start Email Scheduler Function
const startEmailScheduler = () => {
  // Cron Job: Run every weekday at 6 PM EST
  cron.schedule('0 18 * * 1-5', async () => {
    console.log('Running scheduled job: Sending user data email');
    try {
      const filePath = await generateExcelFile();

      // Email options
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'yzhang@tccm.org',
        subject: 'Daily User Data Report (All Historical Data)',
        text: 'Attached is the daily user data report containing all historical data.',
        attachments: [{ filename: 'all_user_data.xlsx', path: filePath }],
      };

      // Send email
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully with historical user data report.');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });
};

const sendTestEmail = async () => {
  console.log('Running test: Sending user data email');
  try {
    const filePath = await generateExcelFile();

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'yzhang@tccm.org', // You can replace this with a test email address
      subject: 'Test User Data Report',
      text: 'This is a test email with user data report.',
      attachments: [{ filename: 'all_user_data.xlsx', path: filePath }],
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully with historical user data report.');
  } catch (error) {
    console.error('Error sending test email:', error);
  }
};

module.exports = { startEmailScheduler, sendTestEmail };

// module.exports = { startEmailScheduler };
