const browseInput =
document.getElementById("browseInput");

const browseOutput =
document.getElementById("browseOutput");

browseInput.onclick = async () => {

    const folder =
        await window.api.selectFolder();

    if (folder)
        inputFolder.value = folder;

};

browseOutput.onclick = async () => {

    const folder =
        await window.api.selectFolder();

    if (folder)
        outputFolder.value = folder;

};

startButton.onclick = async () => {

    const options = {

        inputFolder:
            inputFolder.value,

        outputFolder:
            outputFolder.value,

        dateRange:
            dateRange.value,

        keepFiles:
            keepFiles.checked,

        generatePdf:
            generatePdf.checked,

        openFolder:
            openFolder.checked

    };

    window.api.startProcessing(options);

};