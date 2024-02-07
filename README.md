# vcolink

This project is based off vhl.ink - only main difference is that database is stored through Cloudflare D1 instead of AWS. 

Custom link shortener service using Cloudflare Workers + KV store on your domain. The Workers free tier is quite generous and perfectly suited for this since KV is optimized for high reads and infrequent writes, which is our use case.

This API is easily consumed through web requests.

## Usage

### Creating short links
Send POST request with form data `url` and `path` to redirect vcolink.com/<path> to url.

For authentication, pass a secret key in a `x-preshared-key` header.

If `path` exists already, the value will be overwritten.

#### API Example

```bash
curl --location --request POST "https://vcolink.com" \
    -H "x-preshared-key: <your-secret-key>" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    --data-urlencode "url=<full-url>" \
    --data-urlencode "path=<path>"
```

### Deleting short links

Send DELETE request to the shortlink which should be deleted.

Authentication is required; pass the secret key in the `x-preshared-key` header.

This method is idempotent, being that successive attempts to delete an already-deleted shortlink
will result in status 200 (OK).

Note: Redirect data is not deleted, just the redirect is deactivated.

#### API Example

```bash
curl --location --request DELETE "https://vcolink.com/<path>" \
    -H "x-preshared-key: <your-secret-key>"
```

### Consuming

Open the shortened link to be redirected.

### API
api.vcolink.com allows you to get data stored.

To get all possible paths (and the corresponding redirect URL):
```bash
curl --location --request GET "https://api.vcolink.com/?command=get_all_kv_paths"
```

To get all database entries for a path:
```bash
curl --location --request GET "https://api.vcolink.com/?command=get_analytics_for_path&path=<path>"
```

### Analytics
[analytics.vcolink.com](analytics.vcolink.com) will display all active paths and redirects. Clicking on one of these will give analytics for that path.

## Deploying

This project automatically deploys the api and redirect Cloudflare Workers on push using GitHub Actions. You will need to modify the account, kv namespace, and D1 values in both wrangler.toml, and set the repo secrets `CF_API_TOKEN` and `SECRET_KEY` (this is the preshared header authentication key) that are used in the GitHub Action during deployment.

The visualization_page is automatically deployed on push through CloudFlare pages.
