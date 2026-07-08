const Formatter =
require("./formatter");

const Processor =
require("./processor");

class BatchProcessor {

    async run(files, options) {

        const formatter =
            new Formatter();

        const processor =
            new Processor();

        for (const file of files) {

            await formatter.process(
                file,
                options
            );

            await processor.process(
                file
            );

        }

    }

}

module.exports =
BatchProcessor;