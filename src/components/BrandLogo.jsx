import BrandMark from './BrandMark';

export default function BrandLogo({
  className = '',
  variant = 'light',
  compact = false,
  mobileIconOnly = false,
  iconClassName = '',
  titleClassName = '',
  taglineClassName = '',
}) {
  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <div className={`shrink-0 ${compact ? 'h-11 w-14 sm:h-12 sm:w-16' : 'h-14 w-16 sm:h-16 sm:w-20'} ${iconClassName}`}>
        <BrandMark className="h-full w-full" />
      </div>

      <div className={`min-w-0 ${mobileIconOnly ? 'hidden sm:block' : ''}`}>
        <p
          className={`font-serif font-semibold uppercase leading-none tracking-[0.035em] ${
            compact ? 'text-[0.98rem] sm:text-[1.8rem]' : 'text-2xl sm:text-4xl'
          } ${isDark ? 'text-[#D4AF37]' : 'text-white'} ${titleClassName}`}
        >
          25carat
        </p>
        <p
          className={`mt-1 font-serif italic leading-none ${
            compact ? 'hidden sm:block sm:text-lg' : 'text-lg sm:text-2xl'
          } ${isDark ? 'text-[#F6EED4]' : 'text-white/80'} ${taglineClassName}`}
        >
          Effortless Glamour
        </p>
      </div>
    </div>
  );
}
