export default {
    async fetch(request, env, ctx) {
        switch (request.method) {
          case 'GET':
                return await handleGET(request, env);
          default:
                return new Response('No response.', { status: 404 });
      }
    },
  };
  
  /**
   * Respond to GET requests with the data.
   * @param {Request} request
   */
  async function handleGET(request, env) {
    const psk = request.headers.get('x-preshared-key');
    if (psk !== env.SECRET_KEY) {
        return new Response('Sorry, bad key.', { status: 403 });
    }

    const data = await request.formData();
    const command = data.get('command');

    switch (command) {
        case "get_all_kv_paths":
            const { keys } = await env.LINKS.list();
            return new Response(JSON.stringify(keys), { status: 200, headers: { 'Content-Type': 'application/json' } });
        case "get_analytics_for_path":
            if (!'path' in data) {
                return new Response('Need path set "path" for get_analytics_for_path command.', { status: 404 });
            }
            const path = data.get('path');
            const { results } = await env.ANALYTICS.prepare("SELECT * FROM REDIRECT_ANALYTICS WHERE redirect_key = ?").bind(path).run();
            return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json' } });
        default:
            return new Response('Not a valid command.', { status: 404 });
    }
}


// if (!path) {
//     // Return list of available shortlinks if user supplies admin credentials.
//     const psk = request.headers.get('x-preshared-key');
//     if (psk === env.SECRET_KEY) {
//         const { keys } = await env.LINKS.list();
//         let paths = "";
//         keys.forEach(element => paths += `${element.name}\n`);
        
//         return new Response(paths, { status: 200 });
//     }

//     return new Response(html, {
//         headers: {
//             'content-type': 'text/html;charset=UTF-8',
//         },
//     });
// }