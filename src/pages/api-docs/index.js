import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark as atomOneDark, twilight as monokai } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {useTranslation} from 'react-i18next';

import './index.css';

function APIDocs() {
    const {t} = useTranslation();
    return <div
        className = {'page-wrapper api-docs-page-wrapper'}
    >
        <h1>
            {t('Tarkov Tools API')}
        </h1>
        <h2>
            {t('About')}
        </h2>
        <div
            className='section-text-wrapper'
        >
            {t('The API is available on')} <a href="https://tarkov-tools.com/graphql">https://tarkov-tools.com/graphql</a> with a playground on <a href="https://tarkov-tools.com/___graphql">https://tarkov-tools.com/___graphql</a>.
            {t('It\'s written in graphql and we try our hardest to follow spec and never change or deprecate anything.')}
        </div>
        <h2>
            {t('FAQ')}
        </h2>
        <div
            className='section-text-wrapper'
        >
            <h3>
                {t('Is it free?')}
            </h3>
            {t('Yes. It does however cost money for us to run and maintain, so please consider supporting us on')} <a href="https://www.patreon.com/bePatron?u=26501878&redirect_uri=https%3A%2F%2Ftarkov-tools.com"> Patreon</a>
        </div>
        <div
            className='section-text-wrapper'
        >
            <h3>
                {t('Is there a rate limit?')}
            </h3>
            {t('No')}
        </div>
        <div
            className='section-text-wrapper'
        >
            <h3>
                {t('Wait... really?')}
            </h3>
            {t('Yeah. It\'s actually better if you')} <i>{t('don\'t')}</i> {t('limit your requests to get as fresh data as possible')}
        </div>
        <div
            className='section-text-wrapper'
        >
            <h3>
                {t('Where is the data from?')}
            </h3>
            {t('We source data from multiple places to build an API as complete as possible. We use data from:')}
            <ul>
                <li>
                    <a href="https://escapefromtarkov.fandom.com/wiki/Escape_from_Tarkov_Wiki">Escape from Tarkov Wiki</a>
                </li>
                <li>
                    <a href="https://github.com/TarkovTracker/tarkovdata/">TarkovTracker/tarkovdata</a>
                </li>
                <li>
                    {t('Directly from the game')}
                </li>
                <li>
                    {t('Our network of scanners')}
                </li>
            </ul>
        </div>
        <h2>
            {t('Examples')}
        </h2>
        <div
            className = 'example-wrapper'
        >
            <h3>
                Browser JS {t('example')}
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
                Node JS {t('example')}
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
                Python {t('example')}
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
                CLI {t('example')}
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
                PHP {t('example')}
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
        <div
            className = 'example-wrapper'
        >
            <h3>
                Java 11's HttpClient {t('example')}
            </h3>
            <SyntaxHighlighter
                language = 'java'
                style = {atomOneDark}
            >
                {`import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

class Scratch {
    public static void main(String[] args) throws IOException, InterruptedException {
        ObjectMapper om = new ObjectMapper();
        HttpClient client = HttpClient.newBuilder().build();
        String query = """
                    {
                      itemsByName(name: "m855a1") {
                        id
                        name
                        shortName
                      }
                    }""";
        String jsonQuery = om.writeValueAsString(Map.of("query", query)); // properly escapes
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://tarkov-tools.com/graphql"))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonQuery))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String jsonString = response.body();
        System.out.println(jsonString);
    }
}
`}
            </SyntaxHighlighter>
        </div>
    </div>;
};

export default APIDocs;
