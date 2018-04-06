/* Test script in body
function runText() {
    document.getElementById('myText').innerHTML = "Some text to enter";
}
 */

var trial;
var dt;

function importTree() {
    dt = JSON.parse('{"type":"multi","text":"First","selected":false,"cellWidth":5,"cellHeight":3,"x1":379,"y1":32,"x2":1021,"y2":72,"children":{"yes":{"type":"multi","text":"Second","cellWidth":3,"cellHeight":2,"x1":193,"y1":104,"x2":649,"y2":144,"selected":false,"children":{"A":{"type":"terminal","text":"A","cellWidth":1,"cellHeight":1,"x1":8,"y1":176,"x2":278,"y2":216,"selected":false},"B":{"type":"terminal","text":"B","cellWidth":1,"cellHeight":1,"x1":286,"y1":176,"x2":556,"y2":216,"selected":false},"otherwise":{"type":"terminal","text":"C","cellWidth":1,"cellHeight":1,"x1":564,"y1":176,"x2":834,"y2":216,"selected":false}}},"no":{"type":"multi","text":"Third","cellWidth":2,"cellHeight":2,"x1":935,"y1":104,"x2":1298,"y2":144,"selected":false,"children":{"yes":{"type":"terminal","text":"D","cellWidth":1,"cellHeight":1,"x1":842,"y1":176,"x2":1113,"y2":216,"selected":false},"no":{"type":"terminal","text":"E","cellWidth":1,"cellHeight":1,"x1":1119,"y1":176,"x2":1390,"y2":216,"selected":true}}}}}');
    return dt;
}

// Function form init, runs on "Test Console"
// Let's separate these functions from the computes
function forminit() {
    //import the decision tree
    dt = importTree()

    //if the first node is terminal, then Alert and Exit
    if (dt.type == "terminal") {//if the first and only node is terminal, then this will automatically return first
        alert("The Trial is" + dt.text);
        return;
    }
    //otherwise, run the tree algorithm to select children to run down
    else {
        //may create a while form: while dt.type != "terminal"
        generateForm(dt) //generates the form, with a submit button
        //if submit button is pressed, will need to reassign dt to the child and run again
        //until dt is a terminal node. When DT is a terminal node, then we can exit and give an alert
    }
}

// Function generateForm(): creates interactive form out of keys of decision tree given
// Basically will only call generateForm() the first time if not terminal
function generateForm(decisionTree) {
    // if the node type is terminal, then we can exit
    if (dt.type == "terminal") {
        alert("The Trial this patient is eligible for is " + dt.text);
        return;
    }


    // Number of inputs to create (number of child nodes)
    var number = Object.keys(dt.children).length;

    // Container <div> where dynamic content will be placed
    var container = document.getElementById("container");

    // Clear previous contents of the container (basically empties the form)
    while (container.hasChildNodes()) {
        container.removeChild(container.lastChild);
    }

    var question = document.createElement("p");
    question.setAttribute("id", "question")
    container.appendChild(question);
    document.getElementById('question').innerHTML = dt.text;

    //Create list elements in container <div>
    for (i = 0; i < number; i++) {
        // Append a node with a random text
        container.appendChild(document.createTextNode(Object.keys(dt.children)[i]));
        // Create an <input> element, set its type and name attributes
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "member";
        input.value = Object.keys(dt.children)[i];
        container.appendChild(input);
        // Append a line break
        container.appendChild(document.createElement("br"));
    }

    //Creates a button with the function to take the choice and run the DT down the child node
    var x = document.createElement("button");
    x.setAttribute("id", "FormButton")
    x.setAttribute("class", "button");
    x.setAttribute("onclick", "dynamicSubmit(dt)")//the form resets to the first node here
    container.appendChild(x);
    document.getElementById("FormButton").innerHTML = "Submit"

}

// Function dynamicSubmit() runs when the submit button is pressed by the user
// Takes a Decision Tree
function dynamicSubmit(decisionTree) {

    if (dt.type == "terminal") {
        console.log("terminal is true")
        alert("The Trial this patient is eligible for is " + dt.text);
        return;
    }
    var radios = document.getElementsByName("member");
    var i = 0, len = radios.length;
    var checked = false;
    var userAnswer;

    //basically see what choice the user made
    for (; i < len; i++) {
        if (radios[i].checked) {
            checked = true;
            userAnswer = radios[i].value;
        }
    }

    // if user click submit button without selecting any option, alert box should be say "please select choice answer".
    if (!checked) {
        alert("please select choice answer");
        //return;
    }

    //This for loop basically determines which child was selected and reassigns var dt to the selected child
    for (i = 0; i < len; i++) {
        console.log(userAnswer==Object.keys(dt.children)[i])
        if (userAnswer === Object.keys(dt.children)[i]) {
            dt = eval("dt.children." + Object.keys(dt.children)[i]);
            break;
        }
        else {
            continue;
        }
    }


    if (dt.type == "terminal") {
        console.log("terminal is true")
        alert("The Trial this patient is eligible for is " + dt.text);
    }
    else{
        alert("Resetting Form to the Child Node");
        generateForm(dt);
    }

}