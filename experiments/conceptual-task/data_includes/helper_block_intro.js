var introTrial = (blockName, items) => {
  const pastItems = items.filter(item => item.side === "PAST");
  const futureItems = items.filter(item => item.side === "FUTURE");

  const canvasWidth = 700;
  const canvasHeight = 600;
  const imageSize = 200;
  const padding = 20;
  const verticalSlot = imageSize + 25 + padding;
  const titleXOffset = 0;
  const instructionXOffset = 0;

  const canvas = newCanvas("introCanvas", canvasWidth, canvasHeight);
  const continueButton = newButton("Continue").center().disable();
  const initialYOffset = 30;

  const title = newText("h1", "Let's learn the verbs and their tenses")
    .css({ "font-size": "2.5em", "font-weight": "bold" });
  const instruction = newText("instruction",
    "Press <b>SPACE</b> to reveal each verb and whether that verb is done in the past.")
    .css({ "font-size": "1.5em", "margin-top": "5px" });

  const pastHeading = newText("past", "Past Tense").css({ "font-weight": "bold", "font-size": "1.2em" });
  const futureHeading = newText("future", "Future Tense").css({ "font-weight": "bold", "font-size": "1.2em" });

  const headingXOffset = 50;
  const leftX = canvasWidth / 4 - headingXOffset;
  const rightX = canvasWidth * 3 / 4 - headingXOffset;

  let commands = [];

  commands.push(canvas.print());
  commands.push(canvas.add(titleXOffset, initialYOffset + 20, title));
  commands.push(canvas.add(instructionXOffset, initialYOffset + 90, instruction));
  commands.push(canvas.add(leftX, initialYOffset + 220, pastHeading));
  commands.push(canvas.add(rightX, initialYOffset + 220, futureHeading));

  const allItems = [];
  for (let i = 0; i < Math.max(pastItems.length, futureItems.length); i++) {
    if (pastItems[i]) allItems.push(pastItems[i]);
    if (futureItems[i]) allItems.push(futureItems[i]);
  }

  let yPos = initialYOffset + 260;
  let pastCount = 0;
  let futureCount = 0;

  allItems.forEach(item => {
    const image = newImage(item.verb, item.pic).size(imageSize, imageSize);
    const verbform = newText(`form_${item.verb}`, item.form)
      .css({ "font-size": "1.2em", "font-weight": "bold" });

    let x_center_image, y_pos_image;
    if (item.side === "PAST") {
      x_center_image = canvasWidth / 4 - imageSize / 2;
      y_pos_image = yPos + (pastCount * verticalSlot);
      pastCount++;
    } else {
      x_center_image = canvasWidth * 3 / 4 - imageSize / 2;
      y_pos_image = yPos + (futureCount * verticalSlot);
      futureCount++;
    }

    const verbformXOffset = 15;
    const x_pos_form = x_center_image + verbformXOffset;
    const y_pos_form = y_pos_image + imageSize + 5;

    commands.push(
      newKey(`reveal_${item.verb}`, " ").wait()
    );

    commands.push(
      getCanvas("introCanvas").add(x_center_image, y_pos_image, image),
      getCanvas("introCanvas").add(x_pos_form, y_pos_form, verbform)
    );
  });

  commands.push(newTimer(200).start().wait());
  commands.push(
    continueButton
      .print(canvasWidth / 2 - 40, initialYOffset + 140, "introCanvas") // Positioned below instructions
      .enable()
  );
  commands.push(continueButton.wait());

  return newTrial(
    `intro_${blockName}`,
    ...commands
  )
    .setOption("hideProgressBar", true);
};
