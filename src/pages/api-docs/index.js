import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, monokai } from 'react-syntax-highlighter/dist/esm/styles/hljs';

import './index.css';

function APIDocs() {
    return <div
        className = {'page-wrapper api-docs-page-wrapper'}
    >
        <h1>
            Tarkov Tools API
        </h1>
        <h2>
            About
        </h2>
        <p>
            The API is available on <a href="https://tarkov-tools.com/graphql">https://tarkov-tools.com/graphql</a> with a playground on <a href="https://tarkov-tools.com/___graphql">https://tarkov-tools.com/___graphql</a>.
            It's written in graphql and we try our hardest to follow spec and never change or deprecate anything.
        </p>
        <h2>
            FAQ
        </h2>
        <p>
            <h3>Is it free?</h3>
            Yes. It does however cost money for us to run and maintain, so please consider supporting us on <a href="https://www.patreon.com/bePatron?u=26501878&redirect_uri=https%3A%2F%2Ftarkov-tools.com"> Patreon</a>
        </p>
        <p>
            <h3>Is there a rate limit?</h3>
            No
        </p>
        <p>
            <h3>Wait... really?</h3>
            Yeah. It's actually better if you <i>don't</i> limit your requests to get as fresh data as possible
        </p>
        <p>
            <h3>Where is the data from?</h3>
            We source data from multiple places to build an API as complete as possible. We use data from:
            <ul>
                <li><a href="https://escapefromtarkov.fandom.com/wiki/Escape_from_Tarkov_Wiki">Escape from Tarkov Wiki</a></li>
                <li><a href="https://github.com/TarkovTracker/tarkovdata/">TarkovTracker/tarkovdata</a></li>
                <li>Directly from the game</li>
                <li>Our network of scanners</li>
            </ul>
        </p>
        <h2>
            Examples
        </h2>
        <div
            className = 'example-wrapper'
        >
            <h3>
                Browser JS example
            </h3>
            <SyntaxHighlighter
                language = 'javascript'
                style = {atomOneDark}
            >
                {`fetch('https://tarkov-tools.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  body: JSON.stringify({query: \`{
    itemsByName(name: "m855a1") {
        id
        name
        shortName
    }
}\`})
})
  .then(r => r.json())
  .then(data => console.log('data returned:', data));`}
            </SyntaxHighlighter>
        </div>
        <div
            className = 'example-wrapper'
        >
            <h3>
                Node JS example
            </h3>
            <SyntaxHighlighter
                language = 'javascript'
                style = {atomOneDark}
            >
                {`import { request, gql } from 'graphql-request'

const query = gql\`
{
    itemsByName(name: "m855a1") {
        id
        name
        shortName
    }
}
\`

request('https://tarkov-tools.com/graphql', query).then((data) => console.log(data))`}
            </SyntaxHighlighter>
        </div>
        <div
            className = 'example-wrapper'
        >
            <h3>
                Python example
            </h3>
            <SyntaxHighlighter
                language = 'python'
                style = {monokai}
            >
                {`def run_query(query):
response = requests.post('https://tarkov-tools.com/graphql', json={'query': query})
if response.status_code == 200:
    return response.json()
else:
    raise Exception("Query failed to run by returning code of {}. {}".format(response.status_code, query))


new_query = """
{
    itemsByName(name: "m855a1") {
        id
        name
        shortName
    }
}
"""

result = run_query(new_query)
                print(result)`}
            </SyntaxHighlighter>
        </div>
        <div
            className = 'example-wrapper'
        >
            <h3>
                CLI example
            </h3>
            <SyntaxHighlighter
                language = 'bash'
            >
                {`curl -X POST \
-H "Content-Type: application/json" \
-d '{"query": "{ itemsByName(name: \\"m855a1\\") {id name shortName } }"}' \
https://tarkov-tools.com/graphql`}
            </SyntaxHighlighter>
        </div>
        <div
            className = 'example-wrapper'
        >
            <h3>
                PHP example
            </h3>
            <SyntaxHighlighter
                language = 'php'
                style = {atomOneDark}
            >
                {`$headers = ['Content-Type: application/json'];

$query = '{
  itemsByName(name: "m855a1") {
    id
    name
    shortName
  }
}';
$data = @file_get_contents('https://tarkov-tools.com/graphql', false, stream_context_create([
  'http' => [
    'method' => 'POST',
    'header' => $headers,
    'content' => json_encode(['query' => $query]),
  ]
]));
return json_decode($data, true);`}
            </SyntaxHighlighter>
        </div>
    </div>;
};

export default APIDocs;
