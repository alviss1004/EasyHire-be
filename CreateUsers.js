const bcrypt = require("bcryptjs/dist/bcrypt");
const User = require("./models/User");
var { faker } = require("@faker-js/faker");

/*Code to generate new random users for frontend testing purposes*/

const industries = [
  "Arts & Entertainment",
  "Accommodation & Food Services",
  "Architecture & Design",
  "Business & Finance",
  "Educational Services",
  "Engineering",
  "Healthcare & Social Assistance",
  "Manufacturing",
  "Music & Audio",
  "Programming & Technology",
];

const createUsers = async (numberOfUser) => {
  for (let i = 0; i < numberOfUser; i++) {
    const salt = await bcrypt.genSalt(10);
    let password = "123";
    password = await bcrypt.hash(password, salt);

    const singleUser = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      password,
      isFreelancer: Math.round(Math.random()),
      avatarUrl: faker.internet.avatar(),
      industry: industries[Math.floor(Math.random() * 9)],
      company: faker.company.name(),
      jobTitle: faker.name.jobTitle(),
      aboutMe:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    };

    const duplicateUser = await User.findOne({ email: singleUser.email });
    if (!duplicateUser) {
      await User.create(singleUser);
    }
  }
};
createUsers(100);
