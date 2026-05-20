'use client';
import styles from './page.module.scss';
import { Typography } from 'antd';

const { Title } = Typography;

export default function TermsOfUsePage() {
  return (
    <div id={styles['terms-of-use']}>
      <Title level={1}>Terms of Use</Title>
      <p>PLEASE CAREFULLY READ THIS USER AGREEMENT BEFORE USING THIS SITE.</p>
      <Title level={2}>Acceptance of Terms</Title>
      <p>
        By accessing or using this Ayahay, you agree to be bound by these Terms
        of Use ("Agreement") and any other policies or guidelines linked to this
        Agreement. If you do not agree to these terms, please do not use this
        Site.
      </p>
      <Title level={2}>Changes to Agreement</Title>
      <p>
        We reserve the right to modify this Agreement at any time. It is your
        responsibility to check this Agreement periodically for changes. Your
        continued use of the Site following the posting of changes will
        constitute your acceptance of those changes.
      </p>
      <Title level={2}>USE OF SITE</Title>
      <p>
        AYAHAY grants you a limited, non-transferable license to use this site
        in accordance with this User Agreement. The site is intended solely for
        legitimate reservations or purchases, and you must not use it for
        speculative, false, or fraudulent reservations. The content on this site
        is the property of AYAHAY and may not be copied, reproduced,
        republished, uploaded, posted, transmitted, or distributed without prior
        written permission from AYAHAY. You agree not to use any automated
        devices, such as robots or spiders, to monitor or copy web pages, data,
        or content from this site without prior written permission from AYAHAY.
        Transmitting or transferring any web pages, data, or content found on
        this site to any other medium for mass distribution or use in commercial
        enterprises is prohibited. Unauthorized use of this site or its
        materials may violate copyright, trademark, or other intellectual
        property laws. You must retain all copyright and trademark notices in
        the materials and not alter or obscure any such notices. Posting or
        transmitting any unlawful, threatening, libelous, defamatory, obscene,
        indecent, inflammatory, pornographic, or profane material or any
        material that could violate any law is strictly prohibited. You are
        solely responsible for any damages resulting from copyright infringement
        or other harm resulting from your use of this site.
      </p>
      <Title level={2}>RESPONSIBILITY</Title>
      <p>
        If you use this site, you are responsible for maintaining the
        confidentiality of your account information and password. You accept
        responsibility for all activities under your account or password. You
        represent that you are of legal age to use this site and incur legal
        obligations resulting from its use. Financial responsibility for all
        uses of this site under your login information rests with you.
      </p>
      <Title level={2}>REVIEW OF TRANSMISSIONS</Title>
      <p>
        AYAHAY reserves the right to monitor and review information transmitted
        through this site, censor, edit, remove, or prohibit inappropriate
        content. Your use of this site constitutes your consent to such
        monitoring and review. If you submit suggestions, ideas, comments, or
        questions, you grant AYAHAY and its affiliates the right to use,
        reproduce, modify, adapt, publish, translate, create derivative works,
        distribute, and display such content.
      </p>
      <Title level={2}>EXCLUSION OF WARRANTY</Title>
      <p>
        AYAHAY and third-party providers make no warranty of any kind regarding
        this site and its materials, provided on an "As Is" basis. Accuracy,
        completeness, currency, or reliability of the content or data found on
        this site is not guaranteed. AYAHAY and third-party providers expressly
        disclaim all warranties and conditions, including implied warranties and
        conditions of merchantability, fitness for a particular purpose, and
        non-infringement.
      </p>
      <Title level={2}>LIMITATION OF LIABILITY</Title>
      <p>
        AYAHAY and third-party providers shall not be liable for any injury,
        loss, claim, damage, or any special, exemplary, punitive, indirect,
        incidental, or consequential damages of any kind arising from (I) any
        use of this site or content found herein, (II) any failure or delay, or
        (III) the performance or non-performance by AYAHAY or third-party
        providers. In no event shall the liability of AYAHAY or third-party
        providers exceed the greater of (a) the ticket price or (b) Five
        Thousand Pesos (P5,000.00). AYAHAY, at its discretion and without
        notice, may terminate or restrict access to any component of this site
        at any time.
      </p>
      <Title level={2}>INDEMNIFICATION</Title>
      <p>
        You shall defend and indemnify AYAHAY and third-party providers from any
        claim, cause of action, or demand, including legal and accounting fees,
        arising from your use of this site.
      </p>
      <Title level={2}>LINKS</Title>
      <p>
        This site may contain links to other websites provided solely as a
        convenience. AYAHAY is not responsible for the content of any other
        websites and makes no representation or warranty regarding their
        contents or materials. Accessing other websites is at your own risk.
      </p>
      <Title level={2}>RELATIONSHIP</Title>
      <p>
        The relationship between AYAHAY and you is that of independent
        contractors. Neither party is construed as partners, joint ventures,
        fiduciaries, employees, or agents of the other.
      </p>
      <Title level={2}>INJUNCTIVE RELIEF</Title>
      <p>
        You acknowledge that a violation of this User Agreement will cause
        irreparable damage. AYAHAY is entitled to an injunction restraining such
        violation or attempted violation, along with recovery of associated
        costs and expenses.
      </p>
      <Title level={2}>TERMINATION</Title>
      <p>
        AYAHAY may terminate this User Agreement and the provision of services
        at any time for any reason, including improper site use or failure to
        comply with these terms and conditions. Termination shall not affect any
        rights to relief to which AYAHAY may be entitled. Upon termination, all
        rights granted to you will revert to AYAHAY.
      </p>
      <Title level={2}>ASSIGNMENT</Title>
      <p>
        You may not assign, convey, subcontract, or delegate your rights,
        duties, or obligations under this User Agreement.
      </p>
      <Title level={2}>MODIFICATION</Title>
      <p>
        AYAHAY may modify these terms of use at any time. Your continued use of
        this site will be conditioned upon the terms in force at the time of
        your use.
      </p>
      <Title level={2}>BOOKING CONDITIONS</Title>
      <p>
        When purchasing products from this site, you agree to AYAHAY's and the
        operator's terms and conditions, including cancellation and amendment
        penalties.
      </p>
      <Title level={2}>SEPARABILITY CLAUSE</Title>
      <p>
        If any provision of these terms or part thereof is found invalid,
        illegal, or unenforceable, the remaining provisions shall remain valid.
      </p>
      <Title level={2}>ENTIRE AGREEMENT</Title>
      <p>
        This agreement, along with any additional terms and conditions,
        constitutes the entire agreement and supersedes any prior understandings
        or agreements.
      </p>
    </div>
  );
}
