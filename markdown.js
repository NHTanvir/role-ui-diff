// Pure: render a role diff as a Markdown test list for notes/<program>/.
export function diffToMarkdown(d) {
  const L = [`# Role UI diff — \`${d.path}\``, '', `**${d.roleA}** vs **${d.roleB}**`, ''];
  const sec = (title, items, fmt) => {
    if (!items.length) return;
    L.push(`## ${title}`, '');
    for (const i of items) L.push(`- [ ] ${fmt(i)}`);
    L.push('');
  };
  sec(`Actions only ${d.roleA} has — ${d.actions.candidateClass} (try as ${d.roleB})`, d.actions.onlyInA,
      (x) => `${x.label}${x.href ? ` \`${x.href}\`` : ''}${x.score ? ` _(score ${x.score})_` : ''}`);
  sec(`Links only ${d.roleA} has — ${d.links.candidateClass}`, d.links.onlyInA, (x) => `\`${x.v}\``);
  sec(`Form fields only ${d.roleA} has — ${d.fields.candidateClass}`, d.fields.onlyInA,
      (x) => `\`${x.form}\` · ${x.name}${x.privileged ? ' ⚠️privileged' : ''}`);
  return L.join('\n');
}
