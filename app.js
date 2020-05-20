const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const util = require('util');

fs.writeFile = util.promisify(fs.writeFile)

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

const render = require("./lib/htmlRenderer");

// to start prompting
console.log("Please build your team.");

const employees = [];

// initiate by prompting mandatory manager info
async function init(){
   const data = await inquirer.prompt ([
        {
            type: "input",
            name: "name",
            message: "What is your manager's name?"
        },
        {
            type: "input",
            name: "id",
            message: "What is your manager's id?"
        },
        {
            type: "input",
            name: "email",
            message: "What is your manager's email?"
        },
        {
            type: "input",
            name: "officeNumber",
            message: "What is your manager's office number?"
        }
    ])
    const manager = new Manager (data.name, data.id, data.email, data.officeNumber);
    employees.push(manager);
    loopPrompt()
}

// after manager's info is entered, start looping prompts until user chooses "Finish"
async function loopPrompt(){
    try{
      const {role} = await inquirer.prompt (
        {
            type: "list",
            message: "What type of team member would you like to add?",
            name: "role",
            choices: [
              "Engineer",
              "Intern",
              "Finish"
            ]
        })  
        role === "Finish" ? makeTeam() : askInfo(makePrompt(role))
    }catch(err){
        throw err;
    }
}

// generate team.html after user select "Finish"
async function makeTeam(){
    try{
       await fs.writeFile(outputPath, render(employees));
        console.log('Team profile page has been successfully generated.');
    }catch(err){
        throw err;
    }
}

// Passing in a "role" parameter, we push the "extra" Engineer/Intern-specific question to a basic array of questions
function makePrompt(role){
    const questions = [
        {
            type: "input",
            name: "name",
            message: `What is your ${role}'s name?`
        },
        {
            type: "input",
            name: "id",
            message: `What is your ${role}'s id?`
        },
        {
            type: "input",
            name: "email",
            message: `What is your ${role}'s email?`
        } 
    ]

    questions.push(role=== "Engineer" ? {
        type: "input",
        name: "extra",
        message: "What is your Engineer's GitHub username?"
    } : {
        type: "input",
        name: "extra",
        message: "What is your Intern's School?"
    })

    return {questions, role}
}

//sub-classes constructors to be called on depending on the same "role" parameter entered
const classes = {
    Engineer,
    Intern
}

// Depending on the same "role" parameter passed in, ask role-specific questions, 
// then call sub-class constructors, and finally push the info object to employees array
// wait 1s, then loop
async function askInfo({questions,role}){
    const data = await inquirer.prompt(questions);
    var newEmp = new classes[role] (data.name, data.id, data.email, data.extra);
    employees.push(newEmp);
    setTimeout(loopPrompt, 1000)
}

init()


