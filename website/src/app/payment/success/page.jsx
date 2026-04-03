"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentRef = searchParams.get("ref");
  
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!paymentRef) {
      setStatus("error");
      setErrorMessage("No payment reference found.");
      return;
    }

    const processPayment = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/payment/success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_ref: paymentRef })
        });
        
        const data = await res.json();
        
        if (res.ok || data.message === "Payment already processed successfully") {
          setStatus("success");
          setDetails(data);
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Failed to process payment.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage("Network error occurred while verifying the payment.");
      }
    };

    processPayment();
  }, [paymentRef]);

  if (status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <Loader2 className="animate-spin text-primary mb-6" size={48} />
        <h2 className="text-2xl font-bold text-slate-900">Finalizing Your Enrollment...</h2>
        <p className="mt-2 text-slate-500">Please wait while we verify your transaction.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-red-100 p-4 text-red-600 mb-6">
          <XCircle size={48} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Verification Failed</h2>
        <p className="mt-4 text-lg text-slate-600 max-w-md mx-auto">{errorMessage}</p>
        <div className="mt-8 flex gap-4">
          <Link href="/contact" className="secondary-btn">Contact Support</Link>
          <Link href="/enroll" className="primary-btn">Try Again</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-emerald-100 p-4 text-emerald-600 mb-6">
        <CheckCircle2 size={56} />
      </div>
      <h2 className="text-3xl font-extrabold text-slate-900 md:text-5xl">Enrollment Successful!</h2>
      <p className="mt-4 text-lg leading-8 text-slate-600 max-w-lg mx-auto">
        Your payment has been received and your batch seat is confirmed. Welcome to Language Academy!
      </p>

      <div className="mt-8 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left">
        <h3 className="font-bold text-slate-900 mb-4 block border-b border-slate-100 pb-2">Transaction Details</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Reference</span>
            <span className="font-medium text-slate-900">{paymentRef}</span>
          </div>
          {details?.student_id && (
            <div className="flex justify-between">
              <span className="text-slate-500">Student ID</span>
              <span className="font-medium text-slate-900">{details.student_id}</span>
            </div>
          )}
          {details?.enrollment_id && (
            <div className="flex justify-between">
              <span className="text-slate-500">Enrollment ID</span>
              <span className="font-medium text-slate-900">{details.enrollment_id}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Status</span>
            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">Paid & Confirmed</span>
          </div>
        </div>
      </div>

      <div className="mt-10 flex gap-4">
        <Link href="/" className="secondary-btn">Return Home</Link>
        <Link href="/courses" className="primary-btn">Explore More Paths <ArrowRight size={18} /></Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="container-shell">
        <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
