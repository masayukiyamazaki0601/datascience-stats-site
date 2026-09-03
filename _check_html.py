import html.parser, sys, glob

class Checker(html.parser.HTMLParser):
    VOID = {'meta', 'link', 'br', 'img', 'input', 'hr', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr'}
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errs = []
    def handle_starttag(self, tag, attrs):
        if tag not in self.VOID:
            self.stack.append(tag)
    def handle_endtag(self, tag):
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        elif tag in self.stack:
            while self.stack and self.stack[-1] != tag:
                self.errs.append('unclosed: <' + self.stack.pop() + '>')
            if self.stack:
                self.stack.pop()
        else:
            self.errs.append('stray close: </' + tag + '>')

files = sys.argv[1:] if len(sys.argv) > 1 else glob.glob('*.html')
ok = True
for f in files:
    c = Checker()
    c.feed(open(f, encoding='utf-8').read())
    if not c.errs and not c.stack:
        print(f, '=> OK')
    else:
        ok = False
        print(f, '=> PROBLEM')
        for e in c.errs:
            print('   ', e)
        for s in c.stack:
            print('   まだ閉じていない: <' + s + '>')
sys.exit(0 if ok else 1)
