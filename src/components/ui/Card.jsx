export default function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 ${className}`} {...props}>
      {children}
    </div>
  );
}
