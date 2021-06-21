declare var lisp: any;

let currentEndpoint: string;
const graphQLMode = lisp.symbols.ng_graphql_mode;

lisp.defvar(lisp.symbols.ng_graphql_mode_map, lisp.make_keymap(), "keymap");

lisp.define_key(
  lisp.symbols.ng_graphql_mode_map,
  lisp.kbd("C-c C-c"),
  lisp.quote(lisp.symbols.ng_graphql_send_query)
);

lisp.define_derived_mode(
  lisp.symbols.ng_graphql_mode,
  lisp.symbols.prog_mode,
  "GraphQL",
  `A GraphQL mode for editing schemas.

   \\{ng-graphql-mode-map}`
);

lisp.add_to_list(
  lisp.symbols.auto_mode_alist,
  lisp.cons("\\.graphql\\'", lisp.symbols.ng_graphql_mode)
);

lisp.defun({
  name: "ng-graphql-send-query",
  docString: "",
  interactive: true,
  func: () => sendQuery(),
});

lisp.defun({
  name: "ng-graphql-set-endpoint",
  docString: "",
  interactive: true,
  args: "MInput GraphQL endpoint: ",
  func: (endpoint: string) => (currentEndpoint = endpoint),
});

lisp.defun({
  name: "ng-graphql-current-endpoint",
  docString: "",
  func: () => lisp.print(currentEndpoint),
});

lisp.provide(graphQLMode);

const sendQuery = async () => {
  let query = lisp.buffer_substring_no_properties(
    lisp.point_min(),
    lisp.point_max()
  );

  let body = {
    query,
    variables: {},
  };

  let response = await fetch(currentEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let json = await response.text();

  const resultBuffer = lisp.get_buffer_create("*GraphQL Response*");

  lisp.switch_to_buffer_other_window(resultBuffer);

  lisp.with_current_buffer(resultBuffer, () => {
    lisp.erase_buffer();
    lisp.insert(json);
  });
};
