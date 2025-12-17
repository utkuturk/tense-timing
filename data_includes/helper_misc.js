const newDemo = (name, label) => [
  newTextInput(name)
    .before(
      newText(label)
        .size("15em", "1.5em")
    )
    .size("15em", "1.5em")
    .lines(1)
    .css(underline_blank)   // assume defined elsewhere
    .center()
    .print()
    .log(),
  newText("<br><br>").print()
];

// Helper for "not empty" requirement with error message
const requireFilled = (name, msg) =>
  getTextInput(name)
    .testNot.text("")
    .failure(
      newText("err-" + name, msg)
        .settings.color("red")
        .print()
    );

var button_css = {
  "background-color": "#E03A3E",
  color: "white",
  "font-size": "1.25em",
  padding: "0.5em",
  "border-radius": "0.25em",
  // "width": "4em",
  margin: "0 auto",
  "text-align": "center",
  border: "none", // Remove default button border
  display: "block", // To center the button
};

var text_css = {
  margin: "0 auto",
  "font-size": "20px",
  "font-family": "sans-serif",
};

var underline_blank = {
  outline: "none",
  resize: "none",
  border: "0",
  padding: "0",
  margin: "0",
  "margin-left": "1ex",
  "margin-right": "1ex",
  "vertical-align": "-.33em",
  "background-color": "white",
  "border-bottom": "2px solid black",
  display: "inline",
};