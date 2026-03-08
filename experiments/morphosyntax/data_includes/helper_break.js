function defineBreakTrial() {
  newTrial("Break",
    newText("message", "Break")
        .css({ "font-size": "3em", "font-weight": "bold", "color": "#cc0000" })
        .center()
        .print(),

    newText("instruction",
            "Now we are going to learn about other things they did. Please <b>rest for a second</b>.")
        .css({ "font-size": "1.8em", "margin-top": "30px" })
        .center()
        .print(),

    newText("note",
            "Click 'Continue' when you are ready to see the verbs for the next block.")
        .css({ "font-size": "1.2em", "margin-top": "50px" })
        .center()
        .print(),
    newText("space1break", "<p>")
        .center()
        .print(),
    newTimer("break_continue_gate", 2000)
        .start()
        .wait()
        ,
    newButton("Continue")
        .css(button_css)
        .center()
        .print(),
    newKey("break_space_continue", " ").callback(getButton("Continue").click())
        ,
    getButton("Continue")
        .wait()
  )
    .setOption("hideProgressBar", true);
};
