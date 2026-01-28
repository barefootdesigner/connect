// Map nursery groups/names to logo filenames
export function getNurseryLogoUrl(nurseryGroup: string, nurseryName: string): string {
  const group = nurseryGroup.toLowerCase();
  const name = nurseryName.toLowerCase();

  // Check nursery group first
  if (group.includes('bambinos')) {
    return '/nursery-logos/bambinos.png';
  }
  if (group.includes('cromwell') || group.includes('portslade')) {
    return '/nursery-logos/cromwell road and portslade.png';
  }
  if (group.includes('frogmore')) {
    return '/nursery-logos/frogmore.png';
  }
  if (group.includes('home by the sea')) {
    return '/nursery-logos/home by the sea.png';
  }
  if (group.includes('little explorers')) {
    return '/nursery-logos/little explorers.png';
  }
  if (group.includes('muddy boots')) {
    return '/nursery-logos/muddy boots.png';
  }
  if (group.includes('rocking horse')) {
    return '/nursery-logos/rocking horse.png';
  }
  if (group.includes('stepping stones')) {
    return '/nursery-logos/stepping stones.png';
  }

  // Check nursery name if group didn't match
  if (name.includes('bambinos')) {
    return '/nursery-logos/bambinos.png';
  }
  if (name.includes('cromwell') || name.includes('portslade')) {
    return '/nursery-logos/cromwell road and portslade.png';
  }
  if (name.includes('frogmore')) {
    return '/nursery-logos/frogmore.png';
  }
  if (name.includes('home by the sea')) {
    return '/nursery-logos/home by the sea.png';
  }
  if (name.includes('little explorers')) {
    return '/nursery-logos/little explorers.png';
  }
  if (name.includes('muddy boots')) {
    return '/nursery-logos/muddy boots.png';
  }
  if (name.includes('rocking horse')) {
    return '/nursery-logos/rocking horse.png';
  }
  if (name.includes('stepping stones')) {
    return '/nursery-logos/stepping stones.png';
  }

  // Default fallback
  return '/nursery-logos/the nursery family.png';
}
