rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
c = rd('home.css')
if 'polish 2: touch' not in c:
    c += '''
/* polish 2: touch targets */
@media (max-width:899px){
 #handin .btn:not(#_):not(#_):not(#_),#result .btn:not(#_):not(#_):not(#_),.nav .btn-sm:not(#_):not(#_){min-height:44px;height:auto}
 #handin summary:not(#_):not(#_){min-height:44px;display:flex;align-items:center;gap:8px}
 footer.site :is(.foot-col,.foot-bottom) a:not(#_):not(#_){display:inline-block;padding:12px 0}
 #crest .crest-pause:not(#_){min-height:44px}
}
'''
    wr('home.css', c)
s = rd('../llms.txt')
a = 'Essays are marked against the published SEAB, Cambridge and IB criteria. '
if a in s:
    wr('../llms.txt', s.replace(a, 'It marks them against the published SEAB, Cambridge and IB criteria. '))
print('ok')
