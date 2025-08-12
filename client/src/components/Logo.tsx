interface LogoProps {
  size?: number;
  className?: string;
}

const Logo = ({ size = 32, className = "" }: LogoProps) => (
  <img
    src="/sunset-hotel-logo-1.jpg"
    alt="Sunset Hotel Management System"
    width={size}
    height={size}
    className={`rounded-lg object-cover ${className}`}
  />
);

export default Logo;
