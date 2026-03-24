# Expense Tracker - Fullstack

# Preview

![Image](https://github.com/user-attachments/assets/44e21c67-9b38-444d-a78e-22762cfe6bd2)


## Table of Contents

- [About The Project](#about-the-project)
- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## About The Project

A full-stack expense tracker application built with React, Node.js, Express.js, MongoDB, GraphQL, Passport, and Tailwind CSS. This project provides a platform for users to track their expenses, categorize them, and visualize their spending habits. It includes user authentication and authorization using Passport, allowing users to manage their own expenses while ensuring data privacy. The application leverages the power of React for building a dynamic and responsive user interface, MongoDB for a flexible and scalable database solution, Express.js for handling server-side logic and API endpoints, GraphQL for efficient data querying, and Tailwind CSS for styling and responsive design.

<a href="https://i.ibb.co/GtLtQkt/expensetracker.gif" target="_blank"><img src="https://i.ibb.co/8dpdg2d/expensetracker.gif" alt="blog-app" border="0" /></a>

### Key Use Cases:

- User authentication and authorization using Passport.
- Add, view, edit, and delete transactions.
- A chart to better track transactions.
- Color-coded cards to track transactions by category.
- Efficient data querying using GraphQL.
- User-friendly and responsive interface built with Tailwind CSS.
- Real-time updates.

## Installation

To set up the project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/SrishtiSinha2003/AI-Based-Expense-Tracker.git
   ```

2. Navigate to the project directory:

   ```bash
   cd expense-tracker-full-stack-app
   ```

3. Install the [dependencies](#dependencies) for the backend side:

   ```bash
   npm install
   ```

4. Set up environment variables:

   - Create a `.env` file in the root directory and add the necessary environment variables.

   ```bash
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

5. Start the backend side development server:

   ```bash
   npm run dev
   ```

6. Open a new terminal and navigate to the frontend directory in project:

   ```bash
   cd expense-tracker-full-stack-app/frontend
   ```

7. Install the [dependencies](#dependencies) for the frontend side:

   ```bash
   npm install
   ```

8. Start the frontend side development server:

   ```bash
   npm run dev
   ```

Now both the backend side and frontend side servers should be running, and you can use the application.

## Usage

To use the expense tracker, follow these steps:

1. Open your browser and navigate to `http://localhost:3000`.
2. Register for a new account or log in with an existing account.
3. Start adding, editing, and deleting transactions to track your expenses.
4. View the updated chart and color-coded cards to visualize your spending habits.

### Example Commands

- To add a new transaction:

  1. Fill out the transaction form.
  2. Submit the form and check the updated chart.

- To manage your transactions:

  1. Click the edit button on any of your transactions.
  2. Update the transaction and click the update button.
  3. Click the delete button to remove any transaction.

## Features

- **Authentication**: Secure login and session management using Passport. Includes login, logout, and registration functionality.
- **Transaction Management**: Add, view, edit, and delete transactions.
- **Charts**: Visualize your transactions with dynamic charts to better track your expenses.
- **Categorization**: Track transactions by category using color-coded cards.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Real-time Updates**: Dynamic updates without page reloads.
- **Server-side Rendering**: Improved performance and SEO with server-side rendering using Express.js.
- **Database Integration**: MongoDB for flexible and scalable data storage.
- **GraphQL**: Efficient data querying and manipulation using GraphQL.
- **Error Handling**: Comprehensive error handling and validation to ensure data integrity and provide meaningful feedback to users.
- **Security**: Implemented security best practices, including password hashing, input validation, and secure authentication mechanisms.

## Technologies Used

- [![React][React.js]][React-url]
- [![Express][Express.js]][Express-url]
- [![MongoDB][MongoDB]][Mongo-url]
- [![Node][Node.js]][Node-url]
- [![GraphQL][GraphQL]][GraphQL-url]
- [![Passport][Passport.js]][Passport-url]
- [![Tailwind][Tailwind.css]][Tailwind-url]

## Dependencies

### Backend Dependencies

- **@apollo/server**: Apollo Server for building a GraphQL server.
- **@graphql-tools/merge**: Utility to merge GraphQL schemas and resolvers.
- **bcrypt**: For hashing passwords and ensuring secure authentication.
- **connect-mongodb-session**: MongoDB-backed session store for Express.
- **dotenv**: Load environment variables from a .env file.
- **express**: Web framework for Node.js.
- **express-session**: Middleware for managing sessions in Express.
- **graphql**: A query language for your API.
- **graphql-passport**: Passport integration for GraphQL.
- **mongoose**: MongoDB object modeling tool designed to work in an asynchronous environment.
- **passport**: Middleware for authentication in Node.js.

### Frontend Dependencies

- **@apollo/client**: Apollo Client for managing GraphQL data in your React application.
- **@tailwindcss/aspect-ratio**: Tailwind CSS plugin for controlling the aspect ratio of an element.
- **@tsparticles/engine**: Engine for creating particles animations.
- **@tsparticles/react**: React component for integrating tsparticles.
- **@tsparticles/slim**: Slim version of tsparticles for smaller bundle size.
- **chart.js**: Simple yet flexible JavaScript charting library for creating charts.
- **clsx**: Utility for constructing `className` strings conditionally.
- **framer-motion**: Provides simple, powerful tools for creating smooth and interactive animations.
- **graphql**: A query language for your API.
- **mini-svg-data-uri**: A utility for converting SVG files into minimal SVG data URIs.
- **react**: JavaScript library for building user interfaces.
- **react-chartjs-2**: React wrapper for Chart.js.
- **react-dom**: Entry point of the DOM-related rendering paths.
- **react-hot-toast**: React component for displaying toast notifications.
- **react-icons**: Include popular icons in your React projects easily.
- **react-router-dom**: DOM bindings for React Router.
- **tailwind-merge**: A utility-first CSS framework for rapid UI development.

## Contributing

Contributions are welcome! To contribute to this project, follow these steps:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.


## 📬 Contact

For questions or feedback, feel free to connect with me on [LinkedIn](https://www.linkedin.com/in/srishti-sinha-06aug082003/).

---

[React.js]: https://img.shields.io/badge/react-000000?style=for-the-badge&logo=react&logoColor=white
[React-url]: https://react.dev
[Express.js]: https://img.shields.io/badge/express-20232A?style=for-the-badge&logo=express&logoColor=61DAFB
[Express-url]: https://expressjs.com
[MongoDB]: https://img.shields.io/badge/mongodb-000000?style=for-the-badge&logo=mongodb&logoColor=white
[Mongo-url]: https://www.mongodb.com
[Node.js]: https://img.shields.io/badge/nodejs-20232A?style=for-the-badge&logo=nodedotjs&logoColor=61DAFB
[Node-url]: https://nodejs.org/en
[GraphQL]: https://img.shields.io/badge/graphql-000000?style=for-the-badge&logo=graphql&logoColor=white
[GraphQL-url]: https://graphql.org
[Passport.js]: https://img.shields.io/badge/passport-20232A?style=for-the-badge&logo=passport&logoColor=61DAFB
[Passport-url]: https://www.passportjs.org
[Tailwind.css]: https://img.shields.io/badge/tailwindcss-000000?style=for-the-badge&logo=tailwindcss&logoColor=white
[Tailwind-url]: https://tailwindcss.com
