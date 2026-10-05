// Generates unlimited IPv4 subnetting questions for the CCNA subject.
// A generator is { subject, topic, make() } where make() returns a question object
// with generated: true (tracked per topic for stats, not scheduled for review).
(function () {
  const Q = (window.QUIZ = window.QUIZ || { questions: [], generators: [] });

  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const toIp = n => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  const maskOf = p => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0);
  const networkOf = (ip, p) => (ip & maskOf(p)) >>> 0;
  const broadcastOf = (ip, p) => (networkOf(ip, p) | (~maskOf(p) >>> 0)) >>> 0;
  const hostsOf = p => Math.pow(2, 32 - p) - 2;

  // Random private host address that is a usable host in its /p subnet.
  function randomHost(p) {
    for (;;) {
      const r = Math.random();
      let ip;
      if (r < 0.4 || p < 16) ip = ((10 << 24) | (rnd(0, 255) << 16) | (rnd(0, 255) << 8) | rnd(0, 255)) >>> 0;
      else if (r < 0.7) ip = ((172 << 24) | (rnd(16, 31) << 16) | (rnd(0, 255) << 8) | rnd(0, 255)) >>> 0;
      else ip = ((192 << 24) | (168 << 16) | (rnd(0, 255) << 8) | rnd(0, 255)) >>> 0;
      if (ip !== networkOf(ip, p) && ip !== broadcastOf(ip, p)) return ip;
    }
  }
  // Mostly /18–/30, sometimes wider prefixes so the "interesting octet" isn't always the last.
  const randomPrefix = () => (Math.random() < 0.75 ? rnd(18, 30) : rnd(9, 17));

  // Explains the block-size method for a given address and prefix.
  function walkthrough(ip, p) {
    const mask = maskOf(p);
    const net = networkOf(ip, p);
    const bc = broadcastOf(ip, p);
    let how;
    if (p % 8 === 0) {
      how = `/${p} ends on an octet boundary, so keep the first ${p / 8} octet(s) and zero the rest.`;
    } else {
      const idx = Math.floor(p / 8);
      const octet = (mask >>> (24 - 8 * idx)) & 255;
      const block = 256 - octet;
      const names = ['1st', '2nd', '3rd', '4th'];
      const val = (ip >>> (24 - 8 * idx)) & 255;
      const start = Math.floor(val / block) * block;
      how = `/${p} → mask ${toIp(mask)}. The interesting octet is the ${names[idx]} (${octet}), so the block size is 256 − ${octet} = ${block}.\n` +
        `${val} falls in the block ${start}–${start + block - 1}.`;
    }
    return `${how}\nNetwork ${toIp(net)}, broadcast ${toIp(bc)}, usable ${toIp(net + 1)} – ${toIp(bc - 1)} (${hostsOf(p).toLocaleString('en-US')} hosts).`;
  }

  const base = { subject: 'ccna', topic: 'Subnetting (generated)', generated: true };
  const fill = (q, answer, extra) => Object.assign({}, base, { type: 'fill', accept: [answer], display: answer }, q, extra);
  function mc(q, correct, distractors) {
    const uniq = [...new Set(distractors.filter(d => d !== correct))].slice(0, 3);
    return Object.assign({}, base, { type: 'mc', choices: [correct, ...uniq], answer: 0 }, q);
  }

  const kinds = [
    function network() {
      const p = randomPrefix(), ip = randomHost(p);
      return fill({ prompt: `What is the network address of ${toIp(ip)}/${p}?`, placeholder: 'a.b.c.d', explanation: walkthrough(ip, p) }, toIp(networkOf(ip, p)));
    },
    function broadcast() {
      const p = randomPrefix(), ip = randomHost(p);
      return fill({ prompt: `What is the broadcast address of ${toIp(ip)}/${p}?`, placeholder: 'a.b.c.d', explanation: walkthrough(ip, p) }, toIp(broadcastOf(ip, p)));
    },
    function range() {
      const p = rnd(20, 30), ip = randomHost(p);
      const net = networkOf(ip, p), bc = broadcastOf(ip, p), size = bc - net + 1;
      const r = (a, b) => `${toIp(a)} – ${toIp(b)}`;
      return mc(
        { prompt: `What is the usable host range for ${toIp(ip)}/${p}?`, explanation: walkthrough(ip, p) },
        r(net + 1, bc - 1),
        [r(net, bc), r(net + 1, bc), r(net + size + 1, bc + size - 1), r(net - size + 1, net - 2)],
      );
    },
    function hosts() {
      const p = rnd(16, 30);
      return fill({
        prompt: `How many usable host addresses are in a /${p} subnet?`,
        explanation: `2^(32 − ${p}) − 2 = 2^${32 - p} − 2 = ${hostsOf(p)}. Subtract 2 for the network and broadcast addresses (/31 point-to-point links are a special case with 2 usable).`,
      }, String(hostsOf(p)), { accept: [String(hostsOf(p)), hostsOf(p).toLocaleString('en-US')] });
    },
    function maskFromPrefix() {
      const p = rnd(8, 30);
      return fill({
        prompt: `Write /${p} as a dotted-decimal subnet mask.`,
        placeholder: '255.x.x.x',
        explanation: `${p} ones followed by ${32 - p} zeros = ${toIp(maskOf(p))}. Octet values: 128, 192, 224, 240, 248, 252, 254, 255.`,
      }, toIp(maskOf(p)));
    },
    function prefixFromMask() {
      const p = rnd(8, 30);
      return fill({
        prompt: `What prefix length is the mask ${toIp(maskOf(p))}?`,
        placeholder: '/n',
        explanation: `Count the 1 bits: ${toIp(maskOf(p))} = /${p}.`,
      }, `/${p}`, { accept: [`/${p}`, String(p)] });
    },
    function sizing() {
      const need = pick([rnd(3, 30), rnd(31, 250), rnd(251, 2000)]);
      const p = 32 - Math.ceil(Math.log2(need + 2));
      return fill({
        prompt: `A subnet must support ${need} hosts. What is the longest prefix (smallest subnet) that fits?`,
        placeholder: '/n',
        explanation: `Need 2^h − 2 ≥ ${need}. h = ${32 - p} host bits gives ${hostsOf(p)} hosts (h = ${31 - p} would give only ${hostsOf(p + 1)}). Prefix = 32 − ${32 - p} = /${p}.`,
      }, `/${p}`, { accept: [`/${p}`, String(p)] });
    },
    function sameSubnet() {
      const p = rnd(20, 30), a = randomHost(p);
      const size = Math.pow(2, 32 - p);
      const same = Math.random() < 0.5;
      let b;
      for (;;) {
        const off = same ? 0 : pick([-size, size]);
        b = (networkOf(a, p) + off + rnd(1, size - 2)) >>> 0;
        if (b !== a) break;
      }
      const yes = networkOf(a, p) === networkOf(b, p);
      const q = mc({
        prompt: `Are ${toIp(a)}/${p} and ${toIp(b)}/${p} in the same subnet?`,
        explanation: `${toIp(a)} → network ${toIp(networkOf(a, p))}\n${toIp(b)} → network ${toIp(networkOf(b, p))}\n` +
          (yes ? 'Same network address, so they are in the same subnet.' : 'Different network addresses, so they need a router to communicate.'),
      }, yes ? 'Yes' : 'No', [yes ? 'No' : 'Yes']);
      return q;
    },
  ];

  Q.generators.push({
    subject: 'ccna',
    topic: 'Subnetting (generated)',
    make: () => pick(kinds)(),
  });
})();
