import { Helmet } from 'react-helmet';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
    atomDark as atomOneDark
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

import './index.css';

function APIDocs() {
    const { t } = useTranslation();
    return [
        <Helmet key={'loot-tier-helmet'}>
            <meta charSet="utf-8" />
            <title>{t('API Documentation')}</title>
            <meta name="description" content="Escape from Tarkov's community made API and its documentation. Learn more about our free and easy to use GraphQL API for EFT." />
        </Helmet>,
        <div className={'page-wrapper api-docs-page-wrapper'}>
            <h1>{t('Tarkov.dev API')}</h1>
            <h2>{t('About')}</h2>
            <div className="section-text-wrapper">
                {t('The API is available on')}{' '}
                <a href="https://api.tarkov.dev/graphql">
                    https://api.tarkov.dev/graphql
                </a>{' '}
                <span>with a playground on</span>{' '}
                <a href="https://api.tarkov.dev/___graphql">
                    https://api.tarkov.dev/___graphql
                </a>
                <span>. </span>
                {t(
                    "It's written in graphql and we try our hardest to follow spec and never change or deprecate anything.",
                )}
            </div>
            <h2>{t('FAQ')}</h2>
            <div className="section-text-wrapper">
                <h3>{t('Is it free?')}</h3>
                {t(
                    'Yes',
                )}{' '}
            </div>
            <div className="section-text-wrapper">
                <h3>{t('Is there a rate limit?')}</h3>
                {t('Yes, but we do not expect legitimate usage to trigger the limit. Just use common sense.')}
                <div></div>
                {t('Price data is updated every 5 minutes, so there\'s really no need to query faster than that.')}
            </div>
            <div className="section-text-wrapper">
                <h3>{t('What about caching?')}</h3>
                {t('Since our data is updated every 5 minutes, we also cache all graphql queries for 5 minutes as well.')}
                <div></div>
                {t('This helps to greatly reduce the load on our servers while making your requests speedy quick!')}
            </div>
            <div className="section-text-wrapper">
                <h3>{t('Where is the data from?')}</h3>
                {t(
                    'We source data from multiple places to build an API as complete as possible. We use data from:',
                )}
                <ul>
                    <li>
                        <a href="https://escapefromtarkov.fandom.com/wiki/Escape_from_Tarkov_Wiki">
                            Escape from Tarkov Wiki
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/TarkovTracker/tarkovdata/">
                            TarkovTracker/tarkovdata
                        </a>
                    </li>
                    <li>{t('Directly from the game')}</li>
                    <li>{t('Our network of scanners')}</li>
                </ul>
            </div>
            <h2>{t('Examples')}</h2>
            <ul>
                <li>
                    <HashLink to="#browser-js">Browser JS</HashLink>
                </li>
                <li>
                    <HashLink to="#node-js">Node JS</HashLink>
                </li>
                <li>
                    <HashLink to="#python">Python</HashLink>
                </li>
                <li>
                    <HashLink to="#ruby">Ruby</HashLink>
                </li>
                <li>
                    <HashLink to="#cli">CLI</HashLink>
                </li>
                <li>
                    <HashLink to="#php">PHP</HashLink>
                </li>
                <li>
                    <HashLink to="#java-11">Java 11</HashLink>
                </li>
                <li>
                    <HashLink to="#csharp">C#</HashLink>
                </li>
                <li>
                    <HashLink to="#go">Golang</HashLink>
                </li>
            </ul>
            <div className="example-wrapper">
                <h3 id="browser-js">Browser JS {t('example')}</h3>
                <SyntaxHighlighter language="javascript" style={atomOneDark}>
                    {`fetch('https://api.tarkov.dev/graphql', {
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
            <div className="example-wrapper">
                <h3 id="node-js">Node JS {t('example')}</h3>
                <SyntaxHighlighter language="javascript" style={atomOneDark}>
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

request('https://api.tarkov.dev/graphql', query).then((data) => console.log(data))`}
                </SyntaxHighlighter>
            </div>
            <div className="example-wrapper">
                <h3 id="python">Python {t('example')}</h3>
                <SyntaxHighlighter language="python" style={atomOneDark}>
                    {`import requests

def run_query(query):
    response = requests.post('https://api.tarkov.dev/graphql', json={'query': query})
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
            <div className="example-wrapper">
                <h3 id="ruby">Ruby {t('example')}</h3>
                <cite>
                    <span>Contributed by </span>
                    <Link to="https://github.com/GrantBirki">
                        GrantBirki
                    </Link>
                </cite>
                <SyntaxHighlighter language="ruby" style={atomOneDark}>
                    {`# frozen_string_literal: true

require 'net/http'
require 'uri'
require 'json'

uri = URI.parse("https://api.tarkov.dev/graphql")

header = { "Content-Type": "application/json" }
query = { "query": "{ itemsByName(name: \\"m855a1\\") {id name shortName } }" }

# Create the HTTP object
http = Net::HTTP.new(uri.host, uri.port)
http.use_ssl = true
request = Net::HTTP::Post.new(uri.request_uri, header)
request.body = query.to_json

# Send the request
response = http.request(request)

# Display request results
puts response.code
puts response.message
puts response.body`}
                </SyntaxHighlighter>
            </div>
            <div className="example-wrapper">
                <h3 id="cli">CLI {t('example')}</h3>
                <SyntaxHighlighter language="bash" style={atomOneDark}>
                    {`curl -X POST \
-H "Content-Type: application/json" \
-d '{"query": "{ itemsByName(name: \\"m855a1\\") {id name shortName } }"}' \
https://api.tarkov.dev/graphql`}
                </SyntaxHighlighter>
            </div>
            <div className="example-wrapper">
                <h3 id="php">PHP {t('example')}</h3>
                <SyntaxHighlighter language="php" style={atomOneDark}>
                    {`$headers = ['Content-Type: application/json'];

$query = '{
  itemsByName(name: "m855a1") {
    id
    name
    shortName
  }
}';
$data = @file_get_contents('https://api.tarkov.dev/graphql', false, stream_context_create([
  'http' => [
    'method' => 'POST',
    'header' => $headers,
    'content' => json_encode(['query' => $query]),
  ]
]));
return json_decode($data, true);`}
                </SyntaxHighlighter>
            </div>
            <div className="example-wrapper">
                <h3 id="java-11">
                    <span>Java 11's HttpClient {t('example')}</span>
                    <cite>
                        <span>Contributed by </span>
                        <Link to="https://github.com/HeyBanditoz">
                            Banditoz
                        </Link>
                    </cite>
                </h3>
                <SyntaxHighlighter language="java" style={atomOneDark}>
                    {`import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

class Scratch {
    public static void main(String[] args) throws IOException, InterruptedException {
        HttpClient client = HttpClient.newBuilder().build();
        String query = "{\\"query\\": \\"{ itemsByName(name: \\\\\\"m855a1\\\\\\") {id name shortName } }\\"}";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.tarkov.dev/graphql"))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(query))
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        String jsonString = response.body();
        System.out.println(jsonString);
    }
}
`}
                </SyntaxHighlighter>
            </div>
            <div className="example-wrapper">
                <h3 id="csharp">
                    <span>C# {t('example')}</span>
                    <cite>Contributed by BambusBo</cite>
                </h3>
                <SyntaxHighlighter language="csharp" style={atomOneDark}>
                    {`var data = new Dictionary<string, string>()
{
    {"query", "{itemsByName(name: \\"m855a1\\") { id name shortName }}"}
};

using (var httpClient = new HttpClient())
{

    //Http response message
    var httpResponse = await httpClient.PostAsJsonAsync("https://api.tarkov.dev/graphql", data);

    //Response content
    var responseContent = await httpResponse.Content.ReadAsStringAsync();

    //Print response
    Debug.WriteLine(responseContent);

}`}
                </SyntaxHighlighter>
            </div>
            <div className="example-wrapper">
                <h3 id="go">
                    <span>Go {t('example')}</span>
                    <cite>
                        <span>Contributed by </span>
                        <Link to="https://github.com/HeyBanditoz">
                            Banditoz
                        </Link>
                    </cite>
                </h3>
                <SyntaxHighlighter language="go" style={atomOneDark}>
                    {`package main

import (
    "fmt"
    "io"
    "log"
    "net/http"
    "strings"
)

func main() {
    body := strings.NewReader(\`{"query": "{ itemsByName(name: \\"m855a1\\") {id name shortName } }"}\`)
    req, err := http.NewRequest("POST", "https://api.tarkov.dev/graphql", body)
    if err != nil {
        log.Fatalln(err)
    }
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("Accept", "application/json")

    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        log.Fatalln(err)
    }
    bodyBytes, err := io.ReadAll(resp.Body)
    if err != nil {
        log.Fatalln(err)
    }
    bodyString := string(bodyBytes)
    fmt.Println(bodyString)

    defer resp.Body.Close()
}`}
                </SyntaxHighlighter>
            </div>
        </div>
    ];
}

export default APIDocs;
