type Props = {
  isHomepage?: boolean;
};

export const Footer = ({ isHomepage }: Props) => {
  return (
    <footer
      className={
        isHomepage
          ? "text-center"
          : "mx-auto w-full max-w-7xl p-8 text-center max-sm:px-4"
      }
    >
      Made with ❤️ by <a href="mailto:petr@pacas.cz">Petr Pacas</a>
    </footer>
  );
};
