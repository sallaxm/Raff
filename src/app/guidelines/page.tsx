export default function GuidelinesPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 backdrop-blur-xl p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
        
        <h1 className="text-3xl font-semibold">
          Upload Guidelines
        </h1>

        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Raff exists to help students study smarter — not to violate university rules.
          Please read these guidelines before uploading any material.
        </p>

        <div className="mt-6 space-y-4">

          <div>
            <h2 className="font-semibold text-lg">
              ✅ Allowed
            </h2>

            <ul className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-300">
              <li>• Your own notes</li>
              <li>• Assignments that have already been submitted and graded</li>
              <li>• Lab reports</li>
              <li>• Practice material shared publicly by instructors</li>
              <li>• Study guides you created</li>
              <li>• Older past papers that are openly circulated</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg text-rose-600">
              ❌ Not Allowed
            </h2>

            <ul className="mt-2 space-y-1 text-zinc-600 dark:text-zinc-300">
              <li>• Leaked exams or tests</li>
              <li>• Materials obtained through hacking or private course access</li>
              <li>• Copyrighted textbooks or paid solutions</li>
              <li>• Instructor-only documents</li>
              <li>• Anything that could get students or faculty in trouble</li>
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              Moderation
            </h2>

            <p className="mt-2 text-zinc-600 dark:text-zinc-300">
              All uploads are reviewed by moderators. Content that violates these
              rules will be removed, and repeated violations may result in
              account suspension.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-lg">
              When in doubt — don’t upload
            </h2>

            <p className="mt-2 text-zinc-600 dark:text-zinc-300">
              If you are unsure whether something is allowed, it probably isn’t.
              Raff prioritizes academic integrity and student safety.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}