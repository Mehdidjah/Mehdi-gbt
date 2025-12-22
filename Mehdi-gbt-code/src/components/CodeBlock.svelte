<script lang="ts">
	import hljs from 'highlight.js/lib/core';

	// languages
	import xml from 'highlight.js/lib/languages/xml';
	import css from 'highlight.js/lib/languages/css';
	import json from 'highlight.js/lib/languages/json';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import shell from 'highlight.js/lib/languages/shell';
	import php from 'highlight.js/lib/languages/php';
	import bash from 'highlight.js/lib/languages/bash';

	hljs.registerLanguage('xml', xml);
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('json', json);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('shell', shell);
	hljs.registerLanguage('php', php);
	hljs.registerLanguage('bash', bash);

	import 'highlight.js/styles/github-dark.css';

	export let code = '';
	export let language = 'plaintext';

	$: highlighted = (() => {
		const lang = hljs.getLanguage(language) ? language : 'plaintext';
		return hljs.highlight(code, { language: lang }).value;
	})();
</script>

<pre class="rounded-md overflow-auto bg-[#282c34] text-white text-sm p-4">
	<code class="hljs">
		{@html highlighted}
	</code>
</pre>


