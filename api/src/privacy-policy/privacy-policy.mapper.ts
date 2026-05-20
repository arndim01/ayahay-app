import { Injectable } from '@nestjs/common';
import { PrivacyPolicy } from '@prisma/client';
import { IPrivacyPolicy, ParagraphBlock } from '@ayahay/models';

@Injectable()
export class PrivacyPolicyMapper {
  convertPrivacyPolicyToDto(policy: PrivacyPolicy): IPrivacyPolicy {
    let parsedContent: string | ParagraphBlock[];

    if (typeof policy.content === 'string') {
      parsedContent = policy.content;
    } else if (Array.isArray(policy.content)) {
      parsedContent = policy.content as unknown as ParagraphBlock[];
    } else {
      parsedContent = '';
    }

    return {
      id: policy.id,
      shippingLineId: policy.shippingLineId ?? undefined,
      titleId: policy.titleId ?? undefined,
      title: policy.title ?? undefined,
      content: parsedContent,
    };
  }
}
