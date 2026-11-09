rd = lambda p: open(p, encoding='utf-8', newline='').read()
def wr(p, s): open(p, 'w', encoding='utf-8', newline='').write(s)
def sub(p, a, b):
    s = rd(p)
    assert a in s or b in s, (p, a[:60])
    wr(p, s.replace(a, b))
# My white-panel rule also painted the closing button white. Only the section gets it.
sub('home.css', '#closing:not(#_):not(#_),#closing>*:not(#_):not(#_){background:#fff}', '#closing:not(#_):not(#_){background:#fff}')
# Two lines on a phone.
sub('sections/pricing.html', 'Try it free. <span class="keep">Then 4 detailed reports for S$39.</span>', 'Try it free, then 4 reports for S$39')
# Say the sign-up rule as it now works: first marking open, the other 2 need an email.
sub('sections/pricing.html', '<span>3 instant markings, no sign-up.</span>', '<span>3 instant markings. The first needs no sign-up, the other 2 need your email.</span>')
sub('post.py', 'Instant marking is free: 3 markings, no sign-up, for PSLE English, O-Level English and A-Level GP.', 'Instant marking is free: 3 markings for PSLE English, O-Level English and A-Level GP. The first needs no sign-up, the other 2 need your email.')
sub('../app.html', 'No sign-up needed. Results', 'No sign-up for your first marking. Results')
sub('../app.html', '<b>Free</b>, no sign-up needed', '<b>Free</b>, no sign-up for the first marking')
sub('../psle-composition-marking.html', '3 free instant markings, with no sign-up.', '3 free instant markings. The first needs no sign-up, the other 2 need your email.')
print('ok')
