export default {
  async fetch(request, env, ctx) {
	  switch (request.method) {
		case 'POST':
			return await handlePOST(request, env);
		case 'DELETE':
			return await handleDELETE(request, env);
		default:
			return await handleRequest(request, env);
	}
  },
};

const html = `<!DOCTYPE html>
<body>
    <pre>
    This is the link shortener for Vanderbilt Commodore Orchestra. Use a path to be redirected to another page.
    
    Source: <a href="https://github.com/GitHubNoskcaj211/vhl.ink">GitHubNoskcaj211/vhl.ink</a>
    </pre>
</body>`;

/**
 * Respond to POST requests with shortened URL creation
 * @param {Request} request
 */
async function handlePOST(request, env) {
	const psk = request.headers.get('x-preshared-key');
	if (psk !== env.SECRET_KEY) {
		return new Response('Sorry, bad key.', { status: 403 });
	}

	const shortener = new URL(request.url);
	const data = await request.formData();
	const redirectURL = data.get('url');
	const path = data.get('path');

	if (!redirectURL || !path)
		return new Response('`url` and `path` need to be set.', { status: 400 });

	// validate redirectURL is a URL
	try {
		new URL(redirectURL);
	} catch (e) {
		if (e instanceof TypeError) 
			return new Response('`url` needs to be a valid http url.', { status: 400 });
		else throw e;
	};

	if (path.split('/').length != 1) {
		return new Response('Paths with forward slashes are malformed.', { status: 400 });
	}

	// will overwrite current path if it exists
	await env.LINKS.put(path, redirectURL);
	return new Response(`${redirectURL} available at ${shortener}${path}`, {
		status: 201,
	});
}

/**
 * Respond to DELETE requests by deleting the shortlink
 * @param {Request} request
 */
async function handleDELETE(request, env) {
	const psk = request.headers.get('x-preshared-key');
	if (psk !== env.SECRET_KEY) {
		return new Response('Sorry, bad key.', { status: 403 });
	}

	const url = new URL(request.url);
	const path = url.pathname.split('/')[1];
	if (!path) return new Response('Not found', { status: 404 });
	await env.LINKS.delete(path);
	return new Response(`${path} deleted!`, { status: 200 });
}

/**
 * Respond to GET requests with redirects.
 *
 * Authenticated GET requests without a path will return a list of all
 * shortlinks registered with the service.
 * @param {Request} request
 */
async function handleRequest(request, env) {
	const url = new URL(request.url);
	const path = url.pathname.split('/')[1];

	if (!path) {	
		return new Response(html, {
			headers: {
				'content-type': 'text/html;charset=UTF-8',
			},
		});
	}

	const redirectURL = await env.LINKS.get(path);
	if (redirectURL) {
		const { results } = await env.ANALYTICS.prepare("INSERT INTO REDIRECT_ANALYTICS (redirect_time, redirect_key) VALUES (?, ?)").bind(Date.now(), path).run();
		return Response.redirect(redirectURL, 302);
	}

	return new Response('URL not found. Sad!', { status: 404 });
}
