let module Header = {
  let contentLength length => {
    let b = ref "";
    b := !b ^ "Content-Length: ";
    b := !b ^ string_of_int length;
    b := !b ^ "\r\n\r\n";
    !b;
  };
};

let readMessage txLog rxClient => try {
  let () = ignore @@ read_line ();
  let result = JSON.parse rxClient;
  Printf.fprintf txLog "\nresult: %s\n" @@ JSON.show_result result;
  switch result {
    | JSON.Value ((`O members) as value) =>
      try {
        switch (List.assoc "id" members) {
        | `Float _ as id => Some (id, value)
        | _ => None
        };
      } {
      | Not_found => None
      }
    | _ => None
  } [@warning "-4"];
} {
| End_of_file => None
};

let logResult txLog out value => {
  Buffer.add_string out @@ JSON.show_value value;
  Buffer.output_buffer txLog out;
  flush txLog;
};

let sayHello txLog txClient id => {
  let headers = Buffer.create 0;
  let content = Buffer.create 0;
  let e = Jsonm.encoder @@ `Buffer content;
  let emit lexeme => ignore @@ Jsonm.encode e @@ `Lexeme lexeme;
  emit `Os;
  emit (`Name "jsonrpc"); emit (`String "2.0");
  emit (`Name "id"); emit id;
  emit (`Name "result");
    emit `Os;
      emit (`Name "capabilities");
        emit `Os;
          emit (`Name "hoverProvider"); emit (`Bool true);
        emit `Oe;
    emit `Oe;
  emit `Oe;
  ignore @@ Jsonm.encode e `End;
  let contentLength = Header.contentLength @@ Buffer.length content;
  Printf.fprintf txLog "\nheaders: %s\n" @@ contentLength;
  Printf.fprintf txLog "\ncontent: %s\n" @@ Buffer.contents content;
  flush txLog;
  Buffer.add_string headers contentLength;
  Buffer.output_buffer txClient headers;
  Buffer.output_buffer txClient content;
  flush txClient;
};

let loop txLog txClient => {
  let rxClient = `Channel stdin;
  let b = Buffer.create 0;
  let rec go () => {
    Buffer.clear b;
    switch (readMessage txLog rxClient) {
    | None => ()
    | Some (id, value) =>
      logResult txLog b value;
      sayHello txLog txClient id
    };
    switch (readMessage txLog rxClient) {
    | None => ()
    | Some (_, value) =>
      logResult txLog b value
    };
  };
  go ()
};

let () = {
  let txLog = open_out "/tmp/caml-language-server.log";
  let txClient = stdout;
  loop txLog txClient;
};
