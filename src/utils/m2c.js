let marked = require('marked')
let _ = require('min-util')
let qs = require('min-qs')
let inlineLexer = marked.inlineLexer

// module.exports = exports = markdown2confluence

// https://roundcorner.atlassian.net/secure/WikiRendererHelpAction.jspa?section=all
// https://confluence.atlassian.com/display/DOC/Confluence+Wiki+Markup
// http://blogs.atlassian.com/2011/11/why-we-removed-wiki-markup-editor-in-confluence-4/

let MAX_CODE_LINE = 20

function Renderer () { }

let rawRenderer = marked.Renderer

let langArr = 'actionscript3 bash csharp coldfusion cpp css delphi diff erlang groovy java javafx javascript perl php none powershell python ruby scala sql vb html/xml'.split(/\s+/)
let langMap = {
	shell: 'bash',
	html: 'html',
	xml: 'xml'
}
for (let i = 0, x; x = langArr[i++];) {
	langMap[x] = x
}

_.extend(Renderer.prototype, rawRenderer.prototype, {
	paragraph: function (text) {
		return text + '\n\n'
	},

	html: function (html) {
		return html
	},

	heading: function (text, level, raw) {
		return 'h' + level + '. ' + text + '\n\n'
	},

	strong: function (text) {
		console.log(text)
		return '*' + text + '*'
	},

	em: function (text) {
		return '_' + text + '_'
	},

	del: function (text) {
		return '-' + text + '-'
	}
	, codespan: function (text) {
		return '{{' + text + '}}'
	}
	, blockquote: function (quote) {
		return '{quote}' + quote + '{quote}'
	}
	, br: function () {
		return '<br>'
	}
	, hr: function () {
		return '----'
	}
	, link: function (href, title, text) {
		let arr = [href]
		if (text) {
			arr.unshift(text)
		}
		return '[' + arr.join('|') + ']'
	}
	, list: function (body, ordered) {
		let arr = _.filter(_.trim(body).split('\n'), function (line) {
			return line
		})
		let type = ordered ? '#' : '*'
		console.log(arr)
		return _.map(arr, function (line) {
			return type + ' ' + line
		}).join('\n') + '\n\n'

	}
	, listitem: function (body, ordered) {
		return body + '\n'
	}
	, image: function (href, title, text) {
		return '!' + href + '!'
	}
	, table: function (header, body) {
		return header + body + '\n'
	}
	, tablerow: function (content, flags) {
		return content + '\n'
	}
	, tablecell: function (content, flags) {
		let type = flags.header ? '||' : '|'
		return type + content
	}
	, code: function (code, lang) {
		// {code:language=java|borderStyle=solid|theme=RDark|linenumbers=true|collapse=true}
		if (lang) {
			lang = lang.toLowerCase()
		}
		lang = langMap[lang] || 'none'
		let param = {
			language: lang,
			borderStyle: 'solid',
			theme: 'RDark', // dark is good
			linenumbers: true,
			collapse: false
		}
		let lineCount = _.split(code, '\n').length
		if (lineCount > MAX_CODE_LINE) {
			// code is too long
			param.collapse = true
		}
		param = qs.stringify(param, '|', '=')
		return '{code:' + param + '}\n' + code + '\n{code}\n\n'
	}
})

let renderer = new Renderer()

function markdown2confluence (markdown) {
	return marked(markdown, { renderer: renderer })
}

export default markdown2confluence
