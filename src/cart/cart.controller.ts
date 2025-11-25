import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CartService } from './providers/cart.service';
import { Auth } from 'src/shared/decorators/roles.decorator';
import { RoleType } from 'src/utils/constants/role-type';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { TokenPayload } from 'src/utils/interfaces/token-payload.interfaces';
import { ReqCartDto } from './dto/req-cart.dto';

@ApiTags('Cart')
@ApiBearerAuth('access-token')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({
    summary: 'Tambahkan ke keranjang',
    description: 'Memasukan item buku ke keranjang',
  })
  add(@CurrentUser() user: TokenPayload, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(user, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({
    summary: 'Dapatkan semua pesanan',
    description: 'Menampilkan list semua pesanan yang ada di dalam keranjang',
  })
  list(@CurrentUser() user: TokenPayload, @Query() reqParam: ReqCartDto) {
    return this.cartService.getCart(user, reqParam);
  }

  @Patch(':itemId')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({
    summary: 'Dapatkan detail pesanan',
    description:
      'Menampilkan satu { itemId } pesanan yang ada di dalam keranjang',
  })
  update(
    @CurrentUser() user: TokenPayload,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateCartDto,
  ) {
    return this.cartService.updateCartItem(user, itemId, dto);
  }

  @Delete(':itemId')
  @HttpCode(HttpStatus.OK)
  @Auth(RoleType.CUSTOMER, RoleType.ADMIN)
  @ApiOperation({
    summary: 'Remove cart item',
    description:
      'Menghapus satu { itemId } pesanan yang ada di dalam keranjang',
  })
  remove(@CurrentUser() user: TokenPayload, @Param('itemId') itemId: string) {
    return this.cartService.removeItem(user, itemId);
  }
}
