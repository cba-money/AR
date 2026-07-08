const { spawn } =
require("child_process");

class Processor {

    async process(file) {

        return new Promise((resolve, reject) => {

            const python = spawn(

                "python",

                [

                    "python/process.py",

                    file

                ]

            );

            python.on("close", resolve);

            python.stderr.on("data", reject);

        });

    }

}

module.exports = Processor;