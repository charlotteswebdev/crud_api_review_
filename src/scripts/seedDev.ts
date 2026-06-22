import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createConnection } from 'mysql2/promise';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedDevData = async () => {
  try {
    console.log('🌱 Setting up dev database...');

    // Create connection without pool to create database
    const connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    const dbName = process.env.DB_NAME || 'dev_db';
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Database '${dbName}' ready`);

    await connection.end();

    // Now connect to the dev database to run schema and seed
    const { createPool } = require('mysql2/promise');
    const pool = createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Read and execute schema
    const schemaPath = path.resolve(__dirname, '../../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Split schema by statements and execute each
    const statements = schema.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (!statement.includes('CREATE DATABASE')) {
        await pool.execute(statement + ';');
      }
    }
    console.log('✓ Schema initialized');

    // Clear existing data
    await pool.execute('SET FOREIGN_KEY_CHECKS=0');
    await pool.execute('TRUNCATE TABLE comments');
    await pool.execute('TRUNCATE TABLE tasks');
    await pool.execute('TRUNCATE TABLE projects');
    await pool.execute('TRUNCATE TABLE users');
    await pool.execute('SET FOREIGN_KEY_CHECKS=1');
    console.log('✓ Cleared existing data');

    // Create users
    const users = [
      { name: 'Alice Johnson', email: 'alice@example.com' },
      { name: 'Bob Smith', email: 'bob@example.com' },
      { name: 'Carol White', email: 'carol@example.com' },
      { name: 'David Brown', email: 'david@example.com' },
    ];

    const userIds: number[] = [];
    for (const user of users) {
      const [result]: any = await pool.execute(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [user.name, user.email]
      );
      userIds.push(result.insertId);
    }
    console.log(`✓ Created ${users.length} users`);

    // Create projects
    const projects = [
      { name: 'Website Redesign', owner_id: userIds[0] },
      { name: 'Mobile App', owner_id: userIds[1] },
      { name: 'API Integration', owner_id: userIds[2] },
    ];

    const projectIds: number[] = [];
    for (const project of projects) {
      const [result]: any = await pool.execute(
        'INSERT INTO projects (name, owner_id) VALUES (?, ?)',
        [project.name, project.owner_id]
      );
      projectIds.push(result.insertId);
    }
    console.log(`✓ Created ${projects.length} projects`);

    // Create tasks
    const tasks = [
      { title: 'Design mockups', status: 'pending', project_id: projectIds[0] },
      { title: 'Setup development environment', status: 'in-progress', project_id: projectIds[0] },
      { title: 'Implement authentication', status: 'pending', project_id: projectIds[1] },
      { title: 'Create database schema', status: 'completed', project_id: projectIds[1] },
      { title: 'Write API documentation', status: 'in-progress', project_id: projectIds[2] },
      { title: 'Test endpoints', status: 'pending', project_id: projectIds[2] },
      { title: 'Deploy to staging', status: 'pending', project_id: projectIds[0] },
      { title: 'User testing feedback', status: 'in-progress', project_id: projectIds[1] },
    ];

    const taskIds: number[] = [];
    for (const task of tasks) {
      const [result]: any = await pool.execute(
        'INSERT INTO tasks (title, status, project_id) VALUES (?, ?, ?)',
        [task.title, task.status, task.project_id]
      );
      taskIds.push(result.insertId);
    }
    console.log(`✓ Created ${tasks.length} tasks`);

    // Create comments
    const comments = [
      { content: 'Great progress on this task!', user_id: userIds[0], task_id: taskIds[0] },
      { content: 'Need to review the design mockups', user_id: userIds[1], task_id: taskIds[0] },
      { content: 'Setup complete and ready for testing', user_id: userIds[2], task_id: taskIds[1] },
      { content: 'Authentication module looks good', user_id: userIds[3], task_id: taskIds[2] },
      { content: 'All tests passing', user_id: userIds[0], task_id: taskIds[5] },
      { content: 'Ready to merge to main', user_id: userIds[1], task_id: taskIds[5] },
      { content: 'Deployment scheduled for Friday', user_id: userIds[2], task_id: taskIds[6] },
    ];

    for (const comment of comments) {
      await pool.execute(
        'INSERT INTO comments (content, user_id, task_id) VALUES (?, ?, ?)',
        [comment.content, comment.user_id, comment.task_id]
      );
    }
    console.log(`✓ Created ${comments.length} comments`);

    console.log('✅ Dev database seeded successfully!');
    console.log(`\n📊 Data Summary:`);
    console.log(`   Users: ${users.length}`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Tasks: ${tasks.length}`);
    console.log(`   Comments: ${comments.length}`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error seeding dev database:', error);
    await pool.end();
    process.exit(1);
  }
};

seedDevData();
