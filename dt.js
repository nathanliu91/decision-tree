//Each dt object (node) is arranged like this:
// conditional:{"type":"multi","text":"???","selected":false,"cellWidth":16,"cellHeight":5,"x1":...
// 443,"y1":32,"x2":957,"y2":72,"children"
// conditional (null if top), otherwise is the condition of branch
// type = "terminal" vs "multi"
// text = "???" or user entered
// selected = true or false
// cellWidth = ##
// cellHeight = ##
// x1 = xcoord left
// y1 = ycoord top
// x2 = xcoord right
// y2 =ycoord bottom
// children = array of objects (nodes) or NULL

var dt =
    {
        //initiation of global variables
        dt: null,
        selected: null,
        data: null,
        cnv: null,
        ctx: null,

        //drawing contex width
        ctxWidth: 1400,
        ctxHeight: 800,

        //hGap and vGap are variables used for the determination of cell widths and height
        hGap: 8,
        vGap: 32,

        //sets some style variables for the drawing context
        font: '8pt Montserrat',
        textMargin: 8,

        defaultColor: 'black', //default color of box outline - for non-selected box
        selectedColor: '#f00', //selected box color outline - currently red
        termBgColor: '#ccf', //terminal node box color
        binBgColor: '#ccc', //parent node box color

        //initiates variables concerning relative sizes of box objects in the tree
        cellWidth: null,
        cellHeight: null,
        maxCellWidth: 300,
        maxCellHeight: 40,

        // init()
        // Function: initialization on page load
        init: function () {
            this.cnv = document.getElementById('dt'); //retrieves the canvas element called 'dt'
            this.cnv.addEventListener('click', this.click); //detects a click in the canvas
            this.data = document.getElementById('data'); //retrieves the text area called 'data'
            this.ctx = this.cnv.getContext('2d'); //returns a 2D drawing context on the canvas element
            this.ctx.font = this.font; //assigns drawing context font to global font above
            this.reset(true); //calls the rest function below, which basically returns the canvas to a single box

            var url = new String(window.location); //gets the current URL
            loc = url.split('#'); //splits the URL by the symbol "#"
            if (loc.length > 1) { //basically if there was a split
                this.load(loc[1], true); //calls load function below on the second half of the split - WHY???
            }
        },

        // reset()
        // Function: is called on page load (force = true), or after clicking reset button
        reset: function (force) {
            if (force || confirm('Are you sure you want to reset the workspace?')) {
                //basically if reset boolean is true, will reassign dt canvas with the below
                this.dt =
                    {
                        type: 'terminal', //assigns type to 'terminal', meaning that this is a end box (at end of tree)
                        text: '???', //assigns text to '???' - default box text
                        selected: false, //deselects any boxes/objects in the canvas
                    };
                this.render(); //calls render() on the reset function
            }
        },

        // recalcDt()
        // Function: called by recalc(), essentially recalculates the decision tree
        // sets height and width of each cell
        // Height = what level is it on in the tree? 1 is top, 2 is first branch, 3 is 2nd...
        // Width = how big is the box? good for render
        recalcDt: function (dt) {
            // if node is terminal, sets default cell size
            if (dt.type == 'terminal') {
                dt.cellWidth = 1;
                dt.cellHeight = 1;
            }

            //if the node has children (multi type), we gotta make a custom width based on number of children
            else if (dt.type == 'multi') {
                dt.cellWidth = 0;
                dt.cellHeight = 1;

                //run through the entire tree. Basically cell width increases for each child
                for (var k in dt.children) {
                    this.recalcDt(dt.children[k])

                    dt.cellWidth += dt.children[k].cellWidth; //parents = sum of all children
                    //conditional statement: if height > children+1
                    dt.cellHeight = (dt.cellHeight > dt.children[k].cellHeight + 1)
                        ? dt.cellHeight //value if TRUE
                        :(dt.children[k].cellHeight + 1); //value if FALSE
                }
            }
            else {
                throw 'Fatal error';
            }
        },

        // recalcBox()
        // Function: called by recalc() below, essentially determines box sizes by setting coordinates
        recalcBox: function (dt, x1, y1, x2, y2) {
            var fudge = Math.floor((x2 - x1 - this.cellWidth) / 3);

            dt.x1 = x1 + fudge;
            dt.y1 = y1;
            dt.x2 = x2 - fudge;
            dt.y2 = y1 + this.cellHeight;

            var cnt = 0;

            //if there are child nodes, recalculate the boxes for each one
            if (dt.type == 'multi') {
                for (var k in dt.children) {
                    this.recalcBox(dt.children[k], x1 + Math.floor(cnt * ((x2 - x1 + this.hGap)
                        / dt.cellWidth)), y1 + this.cellHeight + this.vGap,
                        x1 + ((cnt + dt.children[k].cellWidth) * Math.floor((x2 - x1 + this.hGap)
                        / dt.cellWidth)) - this.hGap, y2);
                    cnt += dt.children[k].cellWidth;
                }
            }
        },

        // recalc()
        // Function: calculates cell widths and height based on canvas, calls recalcBox() to get new coords for the box
        recalc: function () {
            this.recalcDt(this.dt);

            this.cellWidth = Math.floor((this.ctxWidth - (this.hGap * (this.dt.cellWidth + 1))) / this.dt.cellWidth);
            this.cellHeight = Math.floor((this.ctxHeight - (this.vGap * (this.dt.cellHeight + 1))) / this.dt.cellHeight);

            if (this.cellWidth > this.maxCellWidth) {
                this.cellWidth = this.maxCellWidth;
            }

            if (this.cellHeight > this.maxCellHeight) {
                this.cellHeight = this.maxCellHeight;
            }

            this.recalcBox(this.dt, this.hGap, this.vGap, this.ctxWidth - this.hGap, this.ctxHeight - this.vGap);
        },

        // clear()
        // Function: clears the canvas 2D drawing context, in response to init() or reset()
        clear: function () {
            this.ctx.clearRect(0, 0, this.ctxWidth, this.ctxHeight);
        },

        // renderBox()
        // Function: renders each node (box) in the decision tree
        renderBox: function (dt) {
            if (dt.type == 'terminal') {
                this.ctx.fillStyle = this.termBgColor; //colors all terminal boxes this color
            }
            else if (dt.type == 'multi') {
                this.ctx.fillStyle = this.binBgColor; //colors all parent boxes this color
            }

            if (dt.selected) {
                this.ctx.strokeStyle = this.selectedColor; //colors the outline of the seleceted box
            }
            else {
                this.ctx.strokeStyle = this.defaultColor; //otherwise makes the outlines a default color
            }

            this.ctx.fillRect(dt.x1, dt.y1, (dt.x2 - dt.x1), (dt.y2 - dt.y1)); //fills rect with fillstyle above
            this.ctx.strokeRect(dt.x1, dt.y1, (dt.x2 - dt.x1), (dt.y2 - dt.y1)); //strokes rect with strokestyle above

            this.ctx.strokeStyle = this.defaultColor;
            this.ctx.fillStyle = this.defaultColor;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';

            //adds text to the 2D drawing context at the center (takes average of box x and y coords)
            this.ctx.fillText(dt.text, (dt.x1 + dt.x2) / 2, (dt.y1 + dt.y2) / 2, (dt.x2 - dt.x1) - (2 * this.textMargin));


            if (dt.type == 'multi') {
                for (var k in dt.children) {

                    //this generates the diagonal tree lines
                    this.ctx.beginPath();
                    this.ctx.moveTo((dt.x1 + dt.x2) / 2, dt.y2);
                    this.ctx.lineTo((dt.children[k].x1 + dt.children[k].x2) / 2, dt.children[k].y1);
                    this.ctx.stroke();

                    //this adds the categorical label for the tree criteria
                    this.ctx.fillText(k, (dt.children[k].x1 + dt.children[k].x2) / 2, (dt.y2 + dt.children[k].y1) / 2,
                        (dt.children[k].x2 - dt.children[k].x1) - (2 * this.textMargin));

                    //this calls this function on the child node
                    this.renderBox(dt.children[k]);
                }
            }
        },

        // render() function
        // Function: clears current canvas, recalculates dt, renders, and changes the textbox datavalue to current
        render: function () {
            this.clear(); //calls clear()
            this.recalc(); //calls recalc()
            this.renderBox(this.dt); //calls renderbox(), passing the canvas element
            this.data.value = JSON.stringify(this.dt); //converts the this.dt javascript object into a JSON string
        },

        // select()
        // Function: retrieves the canvas object and the x,y coordinates of click, determines if a node was selected
        // and assigns the boolean selected to TRUE and saves the selected node
        select: function (dt, x, y) {
            dt.selected = false; //sets dt selected to false.

            //This select works its way down the tree to see if any node boxes contain the coordinates of the click
            if ((x >= dt.x1) && (x <= dt.x2)
                && (y >= dt.y1) && (y <= dt.y2)) {
                dt.selected = true; //saves a boolean that determines if ANY node is selected - good for render/funcs
                this.selected = dt; //saves which node was selected
            }
            else if (dt.type == 'multi') { //are there multiple children from this object in the tree?
                for (var k in dt.children) { //if yes, then run a for loop to see if any of those children were selected
                    this.select(dt.children[k], x, y); //run the select function on each child with click coords
                }
            }
        },

        // deselect()
        // Function: basically deselects all nodes by passing an x,y click coordinate outside of the canvas
        deselect: function () {
            this.select(this.dt, -1, -1);
        },

        // click()
        // Function: determines coords of click in the canvas, checks to see if a node was selected, and renders
        click: function (evt) {
            if (dt.selected != null) {
                dt.selected.selected = false;
                dt.selected = null;
            }

            //essentially calculates coordinates in the canvas of click
            var x = evt.clientX - document.documentElement.scrollLeft - dt.cnv.offsetLeft;
            var y = evt.clientY - document.documentElement.scrollTop - dt.cnv.offsetTop;

            //calls the select() function passing the canvas and the coordinates of click
            dt.select(dt.dt, x, y);

            //calls render() function to render new canvas
            dt.render();
        },

        // edit()
        // Function: change text of a given node and render the new canvas
        edit: function () {
            //checks to see if a node is selected
            if (this.selected == null) {
                alert('You must select a node to edit.');
            }
            else {
                //basically reassigns text of the selected node to the input from prompt
                var txt = prompt('Please enter a new text for this node', this.selected.text);
                this.selected.text = txt;

                //renders the new text
                this.render();
            }
        },

        // split()
        // Function: makes two children from a node
        split: function () {
            //checks to see if a node is selected
            if (this.selected == null) {
                alert('You must select a node to split.');
            }
            //checks to see if a terminal node was selected
            else if (this.selected.type != 'terminal') {
                alert('Only terminal nodes may be split.');
            }
            else {
                this.selected.type = 'multi'; //basically says that this node is not a terminal node
                this.selected.text = '???'; //reassigns the selected text to ??? - MAY CHANGE AS THIS SUCKS
                this.selected.selected = true; //the selected node is selected lol

                //Create two children for selected node with boolean yes/no conditional categories
                this.selected.children =
                    {
                        'yes':
                            {
                                type: 'terminal',
                                text: '???',
                            },
                        'no':
                            {
                                type: 'terminal',
                                text: '???',
                            },
                    };

                //renders the canvas again
                this.render();
            }
        },

        // splitMulti()
        // Function: makes multiple children from a given node per user input
        splitMulti: function () {
            if (this.selected == null) {
                alert('You must select a node to split.');
            }
            else if (this.selected.type != 'terminal') {
                alert('Only terminal nodes may be split.');
            }
            else {
                var n = prompt('How many categories would you like?'); //determines number of children to be made
                var x = parseInt(n); //converts string to integer

                if (Number.isNaN(x) || (x < 2)) {
                    alert('At least two categories are required.');
                }

                else {
                    //Get various condition labels for different tree splits - will be useful in RUN
                    var labels = [];
                    for (var i = 0; i != x - 1; ++i) {
                        labels[i] = prompt('Please enter the name of category #' + (i + 1));
                    }
                    labels[x - 1] = 'otherwise'; //basically sets the last label category name. This is an "ELSE" state


                    this.selected.type = 'multi'; //changes type from terminal to children
                    this.selected.text = '???'; //changes text to ??? - MAY CHANGE
                    this.selected.selected = true; //ensures selected node stays selected
                    this.selected.children = {}; //intializes children object

                    //Makes a bunch of children
                    for (var i = 0; i != x; ++i) {
                        this.selected.children[labels[i]] =
                            {
                                type: 'terminal',
                                text: '???',
                            };
                    }

                    this.render();
                }
            }
        },

        // prune()
        // Function: deletes a branch point from a multi node
        prune: function () {
            if (this.selected == null) {
                alert('You must select a node to prune.');
            }
            else if (this.selected.type == 'terminal') {
                alert('Terminal nodes cannot be pruned. Try to prune the parent.');
            }
            else {
                this.selected.type = 'terminal'; //basically makes this node a terminal node
                this.selected.text = '???'; //reassigns text to ??? - DON'T DO THIS
                this.selected.selected = true; //keeps node selected
                this.selected.children = null; //deletes all child nodes

                this.render();
            }
        },

        // importData()
        // Function: enables user import of text to recreate an old decision tree
        importData: function (force) {
            if (force || confirm('Are you sure? Importing raw data will overwrite current workspace.')) {
                this.dt = JSON.parse(this.data.value); //parses the JSON string to create the new decision tree
                this.deselect(); //deselects all nodes
                this.render(); //renders the imported tree
            }
        },

        // load()
        // Function: I get the feeling that this was a vestigial function, from a previous save function
        // Idea was to have a #in the URL, for which you would load JSON string data from previous DT
        load: function (fn, force) {
            var url = new String(window.location);
            loc = url.split('#');
            window.location = loc[0] + '#' + encodeURIComponent(fn);

            var http = new XMLHttpRequest();

            http.open('GET', fn, true);

            http.onreadystatechange = function () {
                if (http.readyState == 4) {
                    dt.data.value = http.responseText;

                    dt.importData(force);
                }
            };

            http.send();
        },

        // runOn()
        // Function: determines what terminal node is the final selection by decision algorithm
        runOn: function (dt) {
            //Checks if this node is a terminal one (aka we have arrived)
            if (dt.type == 'terminal') {
                this.selected = dt;
                dt.selected = true;
            }
            //else, will ask user to prompt which category we go down
            else if (dt.type == 'multi') {
                var answer = prompt(dt.text);
                var def;

                //Runs through the children and sees if the prompt answer matches a child
                for (var k in dt.children) {
                    if (k == answer) {
                        //if there is a match, keep running on the children to get to the bottom
                        return this.runOn(dt.children[k]);
                    }
                    def = k; //sets def to the child
                }

                this.runOn(dt.children[def]); //runs on the child node matching prompt
            }
            else {
                throw 'Fatal error.';
            }
        },

        // run()
        // Function: takes the user through the decision tree based on prompts by category, and selects the final node
        run: function () {
            this.deselect(); //deselects all nodes
            this.runOn(this.dt); //determines and selects which node meets decision criteria
            this.render(); //renders with the final node selected
        },
    };

