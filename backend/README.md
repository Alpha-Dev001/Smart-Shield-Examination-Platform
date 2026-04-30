<p align="center">
  <a href="https://github.com/your-username/exam-system" target="_blank">
    <img src="https://img.shields.io/badge/SecureExam-Proctoring%20Platform-blue.svg" alt="SecureExam Proctoring Platform">
  </a>
</p>

<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://img.shields.io/badge/NestJS-E23D28?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS">
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://www.prisma.io/" target="_blank">
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma">
  </a>
  <a href="https://socket.io/" target="_blank">
    <img src="https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socket.io&logoColor=white" alt="Socket.IO">
  </a>
</p>

<p align="center">
  <strong>🛡️ SecureExam Proctoring Platform</strong><br>
  A comprehensive, enterprise-grade online examination system with real-time proctoring capabilities
</p>

##  Features

###  Authentication & Authorization
- **Multi-Role System**: Admin, Teacher, and Student roles
- **JWT Security**: Secure token-based authentication
- **Password Security**: bcrypt hashing for secure password storage
- **Role-Based Guards**: Granular access control

###  Real-Time Proctoring
- **Live Monitoring**: WebSocket-based real-time student supervision
- **Violation Detection**: Automated flagging for suspicious activities
- **Teacher Dashboard**: Comprehensive monitoring interface
- **Session Management**: Real-time exam session control

###  Examination Management
- **Exam Creation**: Create and manage assessments with ease
- **Class Management**: Organize students into classes
- **Session Tracking**: Complete exam lifecycle management
- **Results Processing**: Automated grading and analytics

###  Real-Time Communication
- **Socket.IO Integration**: Instant bidirectional communication
- **Live Updates**: Real-time notifications for exam events
- **Room-Based Messaging**: Secure communication channels

##  Architecture

### Technology Stack
- **Backend**: NestJS (Progressive Node.js Framework)
- **Language**: TypeScript (Type-safe development)
- **Database**: Prisma ORM with PostgreSQL/MySQL
- **Authentication**: JWT with Passport.js
- **Real-Time**: Socket.IO for WebSocket connections
- **Security**: bcrypt, role-based guards

### System Modules
```
src/
├── auth/           # Authentication & authorization
├── classes/        # Class management
├── exams/          # Exam creation & management
├── sessions/       # Exam session handling
├── results/        # Grading & analytics
├── proctoring/     # Real-time proctoring gateway
├── prisma/         # Database service & configuration
└── main.ts         # Application entry point
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
