import styled, { css } from 'styled-components';

export const Heading = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  margin-top: 6px;
  color: #11689a;
`;

export const Label = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

export const Header = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #11689a;
  margin-bottom: 10px;
`;

export const JustificationContainer = styled.div<{
  $width?: string;
  $justification?: 'center' | 'flex-start' | 'flex-end' | 'space-between';
  $align?: 'center' | 'flex-start' | 'flex-end';
  $direction?: 'column' | 'row';
  $padding?: string | null;
}>(
  ({
    $width = '400px',
    $justification = 'flex-start',
    $align = 'center',
    $direction = 'column',
    $padding = '24px',
  }) => css`
    width: ${$width};
    padding: ${$padding === null ? '0' : $padding};
    display: flex;
    flex-direction: ${$direction};
    align-items: ${$align};
    justify-content: ${$justification};
  `,
);
