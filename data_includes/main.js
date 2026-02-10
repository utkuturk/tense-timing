PennController.ResetPrefix(null);
DebugOff();

// Stimuli are loaded from local files in chunk_includes/.

Sequence("intro", randomize("experiment"), "send", "exit");

// Introduction
newTrial("intro",
    newText("welcome", "Welcome to the norming study!")
        .css("font-size", "1.5em")
        .print(),
    newText("instructions", "<p>In this experiment, you will see a series of pictures.<br>For each picture, select the description that best fits the image.</p>")
        .print(),
    newButton("Start")
        .print()
        .wait()
);

// Main Experiment Loop
// Expects items.csv with columns: verb, past_form, character, pic1, pic2, pic3
Template("items.csv", row => {
    // Randomize task: 50% chance for Tense Task, 50% for Description Task
    const isTenseTask = Math.random() < 0.5;
    const showFutureFirst = Math.random() < 0.5;

    return newTrial("experiment",
        // --- Phase 1: Selection ---
        newText("instr_select", "Which picture best represents 'to " + row.verb + "'?")
            .css("font-size", "1.2em")
            .center()
            .print(),

        newCanvas("images", 900, 300)
            .add(0, 0, newImage("img1", row.pic1).size(300, 300))
            .add(310, 0, newImage("img2", row.pic2).size(300, 300))
            .add(620, 0, newImage("img3", row.pic3).size(300, 300))
            .center()
            .print(),

        newSelector("selection")
            .add(getImage("img1"), getImage("img2"), getImage("img3"))
            .log()
            .wait(),

        // Clear Phase 1 (Keep selected image)
        getText("instr_select").remove(),
        // Check which image was selected and remove the others
        getSelector("selection").test.selected(getImage("img1")).failure(getImage("img1").remove()),
        getSelector("selection").test.selected(getImage("img2")).failure(getImage("img2").remove()),
        getSelector("selection").test.selected(getImage("img3")).failure(getImage("img3").remove()),
        // Center the canvas if needed, or leave as is. Leaving as is preserves the position.

        // --- Phase 2: Norming ---
        // Dynamically assigned task
        newText("instr_norm", "").center().css("font-size", "1.2em"),
        newCanvas("options_tense", 600, 200), // Increased width for full sentences
        newTextInput("input_desc", "").size(400, 100).lines(3).css("border", "1px solid #ccc"),
        newButton("submit_desc", "Submit"),

        // Logic branching based on random assignment
        ...(isTenseTask ? [
            getText("instr_norm").text("<p>For the picture you selected, which description is best?</p>").print(),

            // Define tense options with full sentences
            newText("t_future", row.sentence_future).css("padding", "5px"),
            newText("t_past", row.sentence_past).css("padding", "5px"),
            newText("t_neither", "Neither").css("padding", "5px"),
            newText("t_both", "Both").css("padding", "5px"),

            // Add to canvas in random order
            getCanvas("options_tense")
                .add(0, 0, getText(showFutureFirst ? "t_future" : "t_past"))
                .add(0, 40, getText(showFutureFirst ? "t_past" : "t_future"))
                .add(0, 80, getText("t_neither"))
                .add(0, 120, getText("t_both"))
                .center()
                .print(),

            // Add all to selector
            newSelector("choice")
                .add(getText("t_future"), getText("t_past"), getText("t_neither"), getText("t_both"))
                .keys("1", "2", "3", "4")
                .log()
                .wait()
        ] : [
            // Description Task
            getText("instr_norm").text("<p>Can you describe the picture in a simple sentence?</p>").print(),
            getTextInput("input_desc").center().print().log(),
            getButton("submit_desc").center().print().wait()
        ])
    )
});

SendResults("send");

// Exit
newTrial("exit",
    newText("Thank you for your participation!").print(),
    newButton("void").wait() // Keeps the page open
);
