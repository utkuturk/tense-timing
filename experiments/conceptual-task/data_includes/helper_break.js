function defineBreakTrial() {
  newTrial("Break",
    newText("message", "## Block Break")
        .css({ "font-size": "3em", "font-weight": "bold", "color": "#cc0000" })
        .center()
        .print(),

    newText("instruction",
            "Now we are going to do the <b>next block</b>. Please <b>rest for a second</b>.")
        .css({ "font-size": "1.8em", "margin-top": "30px" })
        .center()
        .print(),

    newText("note",
            "Click 'Continue' when you are ready to see the verbs for the next block.")
        .css({ "font-size": "1.2em", "margin-top": "50px" })
        .center()
        .print(),

    newButton("Continue")
        .center()
        .print()
        .wait()
  )
    .setOption("hideProgressBar", true);
};