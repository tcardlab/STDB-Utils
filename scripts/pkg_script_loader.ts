import { Plugin } from 'vite';

export default function pkg_script_loader({name, path}:{name:string, path:string}): Plugin {
  return {
    name: 'html-transform',
    enforce: "pre",
    transformIndexHtml(html:any) {
      html = html.replace( /<title>(.*?)<\/title>/, `<title>${name}</title>` )
      html = html.replace(/<package.component\/>/, path)
      return html
    }
  }
}