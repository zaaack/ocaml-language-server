import { types } from "../../../shared";

export function parseSyntaxErrors(bsbOutput: string): { [key: string]: types.Diagnostic[] } {
  const parsedDiagnostics = {};

  const reSyntaxErrors = new RegExp ([
    /File "(.*)", line (\d*), characters (\d*)-(\d*):[\s\S]*?/,
    /Error: (.*?)\n[\s\S]*?We've found a bug for you!/,
  ].map((r) => r.source).join(""), "g");

  let errorMatch;
  while (errorMatch = reSyntaxErrors.exec(bsbOutput)) {
    const fileUri = "file://" + errorMatch[1];
    const startLine = Number(errorMatch[2]) - 1;
    const endLine = Number(errorMatch[2]) - 1;
    const startCharacter = Number(errorMatch[3]);
    const endCharacter = Number(errorMatch[4]);
    const message = errorMatch[5].trim();

    const diagnostic: types.Diagnostic = {
      code: "",
      message,
      range: {
        end: {
          character: endCharacter,
          line: endLine,
        },
        start: {
          character: startCharacter,
          line: startLine,
        },
      },
      severity: /^Warning number \d+/.exec(errorMatch[0]) ? types.DiagnosticSeverity.Warning : types.DiagnosticSeverity.Error,
      source: "bucklescript",
    };
    if (!parsedDiagnostics[fileUri]) { parsedDiagnostics[fileUri] = []; }
    parsedDiagnostics[fileUri].push(diagnostic);
  }
  return parsedDiagnostics;
}

export function parseTypeErrors(bsbOutput: string): { [key: string]: types.Diagnostic[] } {
  const parsedDiagnostics = {};
  const reTypeErrors = new RegExp ([
    /(?:We've found a bug for you!|Warning number \d+)\n\s*/, // Heading of the error / warning
    /(.*) (\d+):(\d+)(?:-(\d+)(?::(\d+))?)?\n  \n/, // Capturing file name and lines / indexes
    /(?:.|\n)*?\n  \n/, // Ignoring actual lines content being printed
    /((?:.|\n)*?)/, // Capturing error / warning message
    /(?:\n\S|(?=Warning number \d+)|$)/, // Tail
  ].map((r) => r.source).join(""), "g");

  let errorMatch;
  while (errorMatch = reTypeErrors.exec(bsbOutput)) {
    const fileUri = "file://" + errorMatch[1];
    // Suppose most complex case, path/to/file.re 10:20-15:5 message
    const startLine = Number(errorMatch[2]) - 1;
    const startCharacter = Number(errorMatch[3]) - 1;
    let endLine = Number(errorMatch[4]) - 1;
    let endCharacter = Number(errorMatch[5]); // Non inclusive originally
    const message = errorMatch[6].replace(/\n  /g, "\n");
    if (isNaN(endLine)) {
      // Format path/to/file.re 10:20 message
      endCharacter = startCharacter;
      endLine = startLine;
    } else if (isNaN(endCharacter)) {
      // Format path/to/file.re 10:20-15 message
      endCharacter = endLine + 1; // Format is L:SC-EC
      endLine = startLine;
    }

    const diagnostic: types.Diagnostic = {
      code: "",
      message,
      range: {
        end: {
          character: endCharacter,
          line: endLine,
        },
        start: {
          character: startCharacter,
          line: startLine,
        },
      },
      severity: /^Warning number \d+/.exec(errorMatch[0]) ? types.DiagnosticSeverity.Warning : types.DiagnosticSeverity.Error,
      source: "bucklescript",
    };
    if (!parsedDiagnostics[fileUri]) { parsedDiagnostics[fileUri] = []; }
    parsedDiagnostics[fileUri].push(diagnostic);
  }
  return parsedDiagnostics;
}
