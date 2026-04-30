import type { ReactNode } from 'react'

export function AuthSplitLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <aside className="relative hidden overflow-hidden bg-[#071B3A] lg:block">
          <div className="p-10">
            <div className="text-5xl font-semibold tracking-wide text-white [font-family:ui-serif,Georgia,Cambria,'Times New Roman',Times,serif]">
              SMESH
            </div>
            <div className="mt-2 text-sm text-white/80">Exam monitoring system</div>
          </div>

          <div className="absolute inset-x-0 bottom-0 top-28 flex items-end justify-center p-10">
            <img
              src="/college entrance exam-amico.svg"
              alt="Exam illustration"
              className="h-auto w-full max-w-xl select-none"
              draggable={false}
            />
          </div>
        </aside>

        <main className="smesh-orbs flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-lg">
            <h1 className="smesh-h1 text-center lg:text-left">{title}</h1>
            <div className="mt-10 smesh-card p-7">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}

