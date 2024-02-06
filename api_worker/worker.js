export default {
    async fetch(request, env, ctx) {
        switch (request.method) {
          case 'GET':
                return await handleGET(request, env);
          default:
                return new Response('No response.', { status: 404, headers: corsHeaders });
      }
    },
  };
  
  const corsHeaders = {
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Origin': 'https://analytics.vcolink.com',
  }

  /**
   * Respond to GET requests with the data.
   * @param {Request} request
   */
  async function handleGET(request, env) {
    const url = new URL(request.url);
    const command = url.searchParams.get('command');

    if (!command) {
        return new Response('No command to run.', { status: 404, headers: corsHeaders });
    }
    
    switch (command) {
        case "get_all_kv_paths":
            const keys = await env.LINKS.list();
            const links = [];
            for (const { name } of keys.keys) {
                const value = await env.LINKS.get(name)
                links.push({ name: name, value: value })
            }
            return new Response(JSON.stringify(links), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        case "get_analytics_for_path":
            const path = url.searchParams.get('path');
            if (!path) {
                return new Response('Need path set "path" for get_analytics_for_path command.', { status: 404, headers: corsHeaders });
            }
            const { results } = await env.ANALYTICS.prepare("SELECT * FROM REDIRECT_ANALYTICS WHERE redirect_key = ?").bind(path).run();
            return new Response(JSON.stringify(results), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
        default:
            return new Response('Not a valid command.', { status: 404, headers: corsHeaders });
    }
}
