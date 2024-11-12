import React from 'react';
import icons from './components';

export type IconName = keyof typeof icons;

type Props = {
  name: IconName;
  color?: string;
};

const Icon: React.FC<Props> = ({ name, color = 'lightGrey' }) => {
  const Icon = icons[name];

  return <Icon color={color} />;
};

export default Icon;
