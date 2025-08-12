interface LogoProps {
  size?: number;
  className?: string;
}

const Logo = ({ size = 32, className = "" }: LogoProps) => (
  <img
    src="/sunset-hotel-logo-2.jpg"
    alt="Sunset Hotel Management System"
    width={size}
    height={size}
    className={`rounded-lg object-cover shadow-sm ${className}`}
  />
);

export default Logo;
