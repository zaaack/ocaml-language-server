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
    /(.*), from l(\d*)-c(\d*) to l(\d*)-c(\d*)\n  \n/, // Capturing file name and lines / indexes
    /(?:.|\n)*?\n  \n/, // Ignoring actual lines content being printed
    /((?:.|\n)*?)/, // Capturing error / warning message
    // TODO: Improve message tail/ending pattern in Bucklescript to ease this detection
    /(?:\n\[\d+\/\d+\] (?:\x1b\[[0-9;]*?m)?Building|\nninja: build stopped:|(?=Warning number \d+)|$)/, // Tail
  ].map((r) => r.source).join(""), "g");

  let errorMatch;
  while (errorMatch = reTypeErrors.exec(bsbOutput)) {
    const fileUri = "file://" + errorMatch[1];
    const startLine = Number(errorMatch[2]) - 1;
    const startCharacter = Number(errorMatch[3]);
    const endLine = Number(errorMatch[4]) - 1;
    const endCharacter = Number(errorMatch[5]);
    const message = errorMatch[6].replace(/\n  /g, "\n");

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
