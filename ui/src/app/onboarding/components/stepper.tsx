export function Stepper({ step }: { step: number }) {
  const steps = ["Business", "Customer", "Item", "Rental"];

  return (
    <div className="flex justify-between mb-8">
      {steps.map((s, i) => (
        <div key={s}>
          <p
            className={`text-sm font-bold ${step > i ? "text-[#17cf91]" : "text-[#4e977f]"}`}
          >
            {s}
          </p>
        </div>
      ))}
    </div>
  );
}
