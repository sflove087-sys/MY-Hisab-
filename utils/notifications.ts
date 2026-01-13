
export interface Notification {
  id: string;
  type: 'offer' | 'transaction' | 'security' | 'system';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'offer',
    title: 'ঈদ বোনাস অফার!',
    message: 'মোবাইল রিচার্জে পাচ্ছেন ১০% ইনস্ট্যান্ট ক্যাশব্যাক। অফারটি সীমিত সময়ের জন্য।',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    read: false,
  },
  {
    id: '2',
    type: 'transaction',
    title: 'টাকা গ্রহণ',
    message: 'আপনি আব্দুল্লাহ আল মামুনের কাছ থেকে ৳৫০০.০০ পেয়েছেন।',
    date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    read: false,
  },
  {
    id: '3',
    type: 'security',
    title: 'পিন পরিবর্তন করা হয়েছে',
    message: 'আপনার অ্যাকাউন্টের পিন সফলভাবে পরিবর্তন করা হয়েছে।',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'অ্যাপ আপডেট',
    message: 'আমার ক্যাশ অ্যাপের নতুন সংস্করণ এখন উপলব্ধ। সেরা অভিজ্ঞতার জন্য আপডেট করুন।',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    read: true,
  },
];
