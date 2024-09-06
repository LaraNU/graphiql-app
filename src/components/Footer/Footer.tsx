import GitHubIcon from '@mui/icons-material/GitHub';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import Image from 'next/image';
import rssLogo from '../../../public/rss-logo.svg';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="column" justifyContent="center" alignItems="center" spacing={1}>
            <Typography variant="subtitle1" component="p">
              Our Team:
            </Typography>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                <GitHubIcon></GitHubIcon>
                <Link
                  variant="subtitle2"
                  href="https://github.com/huntertigerx"
                  color="black"
                  underline="hover"
                  target="_blank"
                >
                  {'HunterTigerX'}
                </Link>
              </Stack>
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                <GitHubIcon></GitHubIcon>
                <Link
                  variant="subtitle2"
                  href="https://github.com/c00b3r"
                  color="black"
                  underline="hover"
                  target="_blank"
                >
                  {'c00b3r'}
                </Link>
              </Stack>
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                <GitHubIcon></GitHubIcon>
                <Link
                  variant="subtitle2"
                  href="https://github.com/LaraNU"
                  color="black"
                  underline="hover"
                  target="_blank"
                >
                  {'LaraNU'}
                </Link>
              </Stack>
            </Stack>
          </Stack>
          <Typography variant="h6" component="p">
            2024
          </Typography>
          <Stack direction="column" justifyContent="center" alignItems="center" spacing={1}>
            <Link href="https://rs.school/courses/reactjs" color="black" underline="hover" target="_blank">
              <Image src={rssLogo} alt="Logo" style={{ width: '40px', height: '40px' }} />
            </Link>
          </Stack>
        </Stack>
      </div>
    </footer>
  );
};
