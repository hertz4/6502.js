const codes = require('./codes');

const lex = {
    multi_line: (code) => {
        return lex.line_array(code)
            .map(line => lex.line(line));
    },

    line_array: (code) => {
        const line_iter = /(.*?)(;.*\n|\n)/mg;
        const lines = [];
        let line;
        while ((line = line_iter.exec(code))) {
            lines.push(line[1]);
        }
        return lines;
    },

    line: (line) => {
        // Matching Rules:
        // label:  start of line, or first word ending in :
        // opcode: indented or ".word" not ending in :
        // arg:    the rest of the line :^)
        const [, label, code, arg] = /^(\w+|\s+\w+(?=:)|)[\s:\.]*(\w*)(.*)$/
              .exec(line)
              .map(s => s.trim());

        const [arg_type, arg_data] = lex.op_arg(arg);

        return {label, code, arg, arg_type, arg_data};
    },

    op_arg: (arg) => {
        const clean_arg = arg.replace(/\s+/, ' ');

        const patterns = [
            ['indrx', /[(](.*), ?x[)]/i],
            ['indry', /[(](.*)[)] ?, ?y/i],
            ['ind',   /[(](.*)[)]/],
            ['addrx', /(.*) ?, ?x/i],
            ['addry', /(.*) ?, ?y/i],
            ['immed', /#(.*)/],
            ['add',   /(.+)/],
        ];

        for (const match of patterns) {
            const pat = match[1].exec(arg);
            if (pat) {
                return [match[0], pat[1]].map(s => s.trim());
            }
        }

        return ['none', arg];
    },
};

module.exports = lex;
